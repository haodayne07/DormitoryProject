from flask import request, jsonify
from datetime import datetime
from app.models.rental_model import MaintenanceHistory
from app.extensions import db
from app.models.room_model import Device, Room 
from app.models.auth_model import User 
import traceback

# RM-6: Sinh viên gửi yêu cầu báo hỏng (GIỮ NGUYÊN)
def report_issue_logic():
    data = request.get_json()
    new_report = MaintenanceHistory(
        user_id=data['user_id'],
        devices_id=data.get('devices_id'),
        note=data['note'],
        date_maintenance=datetime.utcnow(),
        devices_status='pending'
    )
    db.session.add(new_report)
    db.session.commit()
    return jsonify({'message': 'Gửi yêu cầu báo hỏng thành success!'}), 201

# =======================================================
# RM-6: ADMIN XEM DANH SÁCH (PHIÊN BẢN BỌC THÉP CHỐNG CRASH)
# =======================================================
def get_all_issues_logic():
    try:
        # Sắp xếp theo ID mới nhất cho an toàn
        issues = MaintenanceHistory.query.order_by(MaintenanceHistory.maintenance_id.desc()).all()
        result = []
        for i in issues:
            # 1. Bọc try-except lấy tên Sinh viên
            student_name = "Sinh viên ẩn danh"
            try:
                if i.user_id:
                    student = User.query.get(i.user_id)
                    if student:
                        student_name = getattr(student, 'full_name', student.username)
            except: pass

            # 2. Bọc try-except lấy tên Thiết bị & Phòng
            device_name = "Thiết bị không xác định"
            room_name = "Chưa rõ phòng"
            try:
                if i.devices_id:
                    device = Device.query.get(i.devices_id)
                    if device:
                        device_name = device.devices_name
                        if device.room_id:
                            room = Room.query.get(device.room_id)
                            if room:
                                room_name = room.room_name
            except: pass

            # 3. Bọc try-except xử lý định dạng Ngày
            date_str = "N/A"
            try:
                if i.date_maintenance:
                    date_str = i.date_maintenance.strftime('%d/%m/%Y %H:%M')
            except: pass

            result.append({
                'id': i.maintenance_id,
                'student_name': student_name,
                'room_name': room_name,
                'device_name': device_name,
                'note': i.note,
                'description': i.note if i.note else "Không có mô tả",
                'status': i.devices_status if i.devices_status else 'pending',
                'date': date_str
            })
        return jsonify(result), 200
    except Exception as e:
        print("--- LỖI BACKEND GET ALL MAINTENANCE ---")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# =======================================================
# ADMIN CẬP NHẬT TRẠNG THÁI SỰ CỐ
# =======================================================
def update_issue_status_logic(issue_id):
    try:
        data = request.json
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({'error': 'Thiếu trạng thái cập nhật'}), 400
            
        history = MaintenanceHistory.query.get(issue_id)
        if not history:
            return jsonify({'error': 'Không tìm thấy yêu cầu'}), 404
            
        history.devices_status = new_status
        
        # Đồng bộ trạng thái thiết bị
        if new_status == 'completed' and history.devices_id:
            device = Device.query.get(history.devices_id)
            if device:
                device.status = 'good'
                
        elif new_status in ['pending', 'processing'] and history.devices_id:
            device = Device.query.get(history.devices_id)
            if device:
                device.status = 'broken'
                
        db.session.commit()
        return jsonify({'message': 'Cập nhật trạng thái thành công!'}), 200
        
    except Exception as e:
        db.session.rollback()
        print("--- LỖI BACKEND UPDATE MAINTENANCE STATUS ---")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500