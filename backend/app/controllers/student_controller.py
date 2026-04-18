from flask import request, jsonify
from app.extensions import db
from app.models.auth_model import User
# THÊM IMPORT BẢNG Bill, RentalRequest VÀO ĐÂY:
from app.models.rental_model import Contract, Payment, Bill, RentalRequest 
from app.models.room_model import Room, Device # Đã thêm Device
from werkzeug.security import generate_password_hash
import traceback
from datetime import datetime

# 1. READ: Lấy danh sách sinh viên
def get_all_students_logic():
    try:
        # Lấy tất cả user có role là student
        students = User.query.filter_by(role='student').all()
        result = []
        
        for student in students:
            # Tự động lấy ID (thử 'id' trước, nếu không có thì lấy 'user_id')
            s_id = getattr(student, 'id', getattr(student, 'user_id', None))
            
            # Tìm hợp đồng đang hoạt động của sinh viên này
            contract = Contract.query.filter_by(user_id=s_id, status='active').first()
            room_name = "Chưa xếp phòng"
            
            if contract:
                room = Room.query.get(contract.room_id)
                if room:
                    room_name = room.room_name

            result.append({
                "user_id": s_id,
                "username": student.username,
                "full_name": getattr(student, 'full_name', student.username),
                "email": student.email,
                "balance": float(getattr(student, 'balance', 0)),
                "room": room_name,
                "status": "active" if contract else "pending"
            })
        return jsonify(result), 200
    except Exception as e:
        print("--- LỖI BACKEND GET STUDENTS ---")
        traceback.print_exc()
        return jsonify({"error": f"Lỗi cơ sở dữ liệu: {str(e)}"}), 500

# 2. CREATE: Thêm sinh viên mới (Đã cập nhật check trùng Email)
def create_student_logic():
    try:
        data = request.json
        if not data.get('username') or not data.get('email'):
            return jsonify({"error": "Thiếu username hoặc email"}), 400

        # Kiểm tra trùng lặp Username
        if User.query.filter_by(username=data['username']).first():
            return jsonify({"error": "Tên đăng nhập này đã tồn tại!"}), 400

        # KIỂM TRA TRÙNG LẶP EMAIL (Xử lý lỗi bạn đang gặp phải)
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": f"Địa chỉ email '{data['email']}' đã được sử dụng!"}), 400

        hashed_pw = generate_password_hash(data.get('password', '123456'))
        
        # Tạo đối tượng User mới với đầy đủ các trường tiềm năng
        new_student = User(
            username=data['username'],
            email=data['email'],
            password=hashed_pw,
            role='student'
        )
        
        # Chỉ gán các trường nếu Model có khai báo để tránh lỗi
        if hasattr(new_student, 'full_name'): new_student.full_name = data.get('username')
        if hasattr(new_student, 'balance'): new_student.balance = 0.0
        if hasattr(new_student, 'phone'): new_student.phone = ""

        db.session.add(new_student)
        db.session.commit()
        return jsonify({"message": "Thêm sinh viên thành công!"}), 201
    except Exception as e:
        db.session.rollback()
        print("--- LỖI BACKEND CREATE STUDENT ---")
        traceback.print_exc()
        # Trả về lỗi chi tiết nếu có lỗi phát sinh khác
        return jsonify({"error": f"Lỗi thêm mới: {str(e)}"}), 400

# 3. UPDATE: Cập nhật thông tin (Đã cập nhật check trùng Email khi đổi email)
def update_student_logic(user_id):
    try:
        user = User.query.get_or_404(user_id)
        data = request.json
        
        # Kiểm tra trùng email nếu người dùng muốn thay đổi email
        if 'email' in data and data['email'] != user.email:
            existing_email = User.query.filter_by(email=data['email']).first()
            if existing_email:
                return jsonify({"error": "Địa chỉ email này đã được sử dụng bởi người khác!"}), 400
            user.email = data['email']

        if 'full_name' in data: user.full_name = data['full_name']
        
        db.session.commit()
        return jsonify({"message": "Cập nhật thành công!"}), 200
    except Exception as e:
        db.session.rollback()
        print("--- LỖI BACKEND UPDATE STUDENT ---")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

# 4. DELETE: Xóa sinh viên
def delete_student_logic(user_id):
    try:
        user = User.query.get_or_404(user_id)
        # Chặn xóa nếu sinh viên đang ở (có hợp đồng active)
        active_c = Contract.query.filter_by(user_id=user_id, status='active').first()
        if active_c:
            return jsonify({"error": "Không thể xóa sinh viên đang ở trong phòng!"}), 400

        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "Xóa thành công!"}), 200
    except Exception as e:
        db.session.rollback()
        print("--- LỖI BACKEND DELETE STUDENT ---")
        traceback.print_exc()
        return jsonify({"error": "Không thể xóa do ràng buộc dữ liệu"}), 400


# =========================================================
# LẤY DỮ LIỆU DASHBOARD CHO TỪNG SINH VIÊN (HỖ TRỢ 3 TRẠNG THÁI)
# =========================================================
def get_student_dashboard_logic(student_id):
    try:
        # Lấy thông tin sinh viên
        student = User.query.get(student_id)
        if not student:
            return jsonify({'error': 'Không tìm thấy sinh viên'}), 404

        # 1. Kiểm tra Hợp đồng đang ở (Trạng thái 3)
        contract = Contract.query.filter_by(user_id=student_id, status='active').first()
        has_room = bool(contract)
        
        # 2. Kiểm tra Yêu cầu đang chờ duyệt (Trạng thái 2)
        pending_request = RentalRequest.query.filter_by(user_id=student_id, status='pending').first()
        has_pending_request = bool(pending_request)

        # Khởi tạo dữ liệu mặc định
        room_info = {"name": "Chưa có phòng", "type": "N/A", "endDate": "N/A"}
        billing_info = {"status": "paid", "amount": 0, "dueDate": "", "month": ""}
        available_rooms_data = []

        if has_room:
            # --- Sinh viên đã có phòng (Lấy dữ liệu như cũ) ---
            if contract.room:
                room_info = {
                    "name": contract.room.room_name,
                    "type": f"Phòng {contract.room.capacity} người",
                    "endDate": contract.end_date.strftime('%d/%m/%Y') if contract.end_date else "N/A"
                }
            
            # Join từ Bill qua Contract để tìm Hóa đơn chưa thanh toán
            unpaid_bill = Bill.query.join(Contract).filter(
                Contract.user_id == student_id, 
                Bill.status == 'unpaid'
            ).first()
            
            if unpaid_bill:
                b_date = unpaid_bill.due_date
                billing_info = {
                    "status": "unpaid",
                    "amount": unpaid_bill.amount,
                    "dueDate": b_date.strftime('%d/%m/%Y') if b_date else "N/A",
                    "month": f"Tháng {b_date.month if b_date else datetime.now().month}"
                }
        elif not has_pending_request:
            # --- Sinh viên chưa có phòng & chưa gửi yêu cầu (Trạng thái 1) ---
            available_rooms = Room.query.filter(Room.status.in_(['Trống', 'available', 'trống', 'vacant', 'Vacant'])).all()
            
            for r in available_rooms:
                # 1. Đếm số hợp đồng active để ra số người đang ở hiện tại
                current_tenants = Contract.query.filter_by(room_id=r.room_id, status='active').count() 
                
                # 2. Lấy danh sách thiết bị từ DB
                amenities_list = [d.devices_name for d in r.devices] if hasattr(r, 'devices') and r.devices else []
                
                available_rooms_data.append({
                    "id": r.room_id,
                    "name": r.room_name,
                    "capacity": r.capacity,
                    "current_tenants": current_tenants,
                    "price": getattr(r, 'price', 1500000), 
                    "image_url": getattr(r, 'image_url', None), 
                    "amenities": amenities_list
                })

        return jsonify({
            'studentName': getattr(student, 'full_name', student.username) or student.username,
            'hasRoom': has_room,                         # Trạng thái 3
            'hasPendingRequest': has_pending_request,    # Trạng thái 2
            'availableRooms': available_rooms_data,      # Dữ liệu cho Trạng thái 1
            'room': room_info,
            'billing': billing_info,
            'maintenance': { "title": "Sửa quạt trần kêu to", "status": "Đang xử lý", "date": "Hôm qua" },
            'events': [ 
                { "id": 1, "title": "Lịch cúp điện Tòa A", "type": "warning", "date": "10/04/2026" },
                { "id": 2, "title": "Đăng ký nội trú học kỳ Hè", "type": "info", "date": "08/04/2026" },
                { "id": 3, "title": "Bảo trì thang máy định kỳ", "type": "maintenance", "date": "05/04/2026" }
            ]
        }), 200

    except Exception as e:
        print("--- LỖI BACKEND GET STUDENT DASHBOARD ---")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


def request_room_logic():
    try:
        data = request.json
        user_id = data.get('user_id')
        room_id = data.get('room_id')
        
        if not user_id or not room_id:
            return jsonify({'error': 'Thiếu thông tin người dùng hoặc phòng'}), 400

        # Kiểm tra xem sinh viên đã có yêu cầu pending nào chưa
        exist = RentalRequest.query.filter_by(user_id=user_id, status='pending').first()
        if exist:
            return jsonify({'error': 'Bạn đã có yêu cầu đang chờ duyệt rồi!'}), 400
            
        new_request = RentalRequest(user_id=user_id, room_id=room_id, status='pending')
        db.session.add(new_request)
        db.session.commit()
        
        return jsonify({'message': 'Gửi yêu cầu thuê phòng thành công!'}), 200
    except Exception as e:
        db.session.rollback()
        print("--- LỖI BACKEND REQUEST ROOM ---")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# =========================================================
# LẤY CHI TIẾT PHÒNG CHO TRANG "PHÒNG CỦA TÔI" (My Room)
# =========================================================
def get_my_room_details_logic(student_id):
    try:
        contract = Contract.query.filter_by(user_id=student_id, status='active').first()
        if not contract:
            return jsonify({'error': 'Bạn hiện chưa có phòng nào.'}), 404

        room = Room.query.get(contract.room_id)
        if not room:
            return jsonify({'error': 'Không tìm thấy thông tin phòng.'}), 404
            
        active_contracts = Contract.query.filter_by(room_id=room.room_id, status='active').all()
        roommates = []
        for c in active_contracts:
            user = User.query.get(c.user_id)
            if user:
                u_id = getattr(user, 'id', getattr(user, 'user_id', None))
                roommates.append({
                    "id": u_id,
                    "name": getattr(user, 'full_name', user.username) or user.username,
                    "email": getattr(user, 'email', 'Chưa cập nhật'),
                    "phone": getattr(user, 'phone', 'Chưa cập nhật'),
                    "is_me": str(u_id) == str(student_id)
                })
        
        devices_data = []
        if hasattr(room, 'devices') and room.devices:
            for d in room.devices:
                devices_data.append({
                    "id": d.devices_id,
                    "name": d.devices_name,
                    "status": getattr(d, 'status', 'good'),
                    "purchase_date": d.purchase_date.strftime('%d/%m/%Y') if getattr(d, 'purchase_date', None) else "N/A"
                })

        return jsonify({
            "room_info": {
                "id": room.room_id,
                "name": room.room_name,
                "capacity": room.capacity,
                "current_tenants": len(roommates),
                "price": room.price,
                "image_url": getattr(room, 'image_url', None)
            },
            "roommates": roommates,
            "devices": devices_data
        }), 200

    except Exception as e:
        print("--- LỖI BACKEND GET MY ROOM DETAILS ---")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# =========================================================
# (ĐÃ FIX TÊN CỘT) LẤY LỊCH SỬ BÁO CÁO SỰ CỐ CỦA SINH VIÊN
# =========================================================
def get_maintenance_history_logic(student_id):
    try:
        from app.models.rental_model import MaintenanceHistory

        # Lấy các yêu cầu bảo trì của sinh viên này
        histories = MaintenanceHistory.query.filter_by(user_id=student_id).all()
        result = []
        
        for h in histories:
            # Tìm tên thiết bị bị hỏng dựa vào devices_id
            device = Device.query.get(h.devices_id) if h.devices_id else None
            
            # Xử lý định dạng ngày tháng từ date_maintenance
            date_str = "Hôm nay"
            if h.date_maintenance:
                date_str = h.date_maintenance.strftime('%d/%m/%Y')
                
            result.append({
                "id": h.maintenance_id,
                "device_name": device.devices_name if device else "Thiết bị không xác định",
                "description": h.note if h.note else "Không có mô tả",
                "status": h.devices_status if h.devices_status else "pending",
                "date": date_str
            })
            
        result.reverse() # Hiển thị báo cáo mới nhất lên đầu
        return jsonify(result), 200
    except Exception as e:
        print("--- LỖI BACKEND GET MAINTENANCE HISTORY ---")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# =========================================================
# (ĐÃ FIX TÊN CỘT) TẠO YÊU CẦU BÁO CÁO SỰ CỐ
# =========================================================
def create_maintenance_request_logic():
    try:
        data = request.json
        student_id = data.get('student_id')
        device_id = data.get('device_id')
        description = data.get('description')

        if not student_id or not device_id or not description:
            return jsonify({'error': 'Thiếu thông tin bắt buộc!'}), 400

        from app.models.rental_model import MaintenanceHistory
            
        # Gán chính xác vào các cột của Model MaintenanceHistory
        new_report = MaintenanceHistory(
            user_id=student_id,
            devices_id=device_id,     # Chú ý chữ 's'
            note=description,         # Lưu mô tả vào cột note
            devices_status='pending'  # Gán trạng thái
        )

        db.session.add(new_report)
        
        # Chuyển trạng thái của thiết bị thành "hỏng" (broken)
        device = Device.query.get(device_id)
        if device:
            device.status = 'broken'

        db.session.commit()
        return jsonify({'message': 'Gửi yêu cầu báo cáo sự cố thành công!'}), 201
    except Exception as e:
        db.session.rollback()
        print("--- LỖI BACKEND CREATE MAINTENANCE ---")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500