from flask import request, jsonify
from app.models.room_model import Room
# QUAN TRỌNG: Nhớ import thêm Bill ở đây
from app.models.rental_model import Contract, RentalRequest, Bill 
from app.models.auth_model import User
from app.extensions import db
from datetime import datetime, timedelta

def get_student_dashboard(user_id):
    try:
        student = User.query.get(user_id)
        student_name = getattr(student, 'full_name', student.username) if student else 'Sinh viên'

        # 1. Kiểm tra Hợp đồng (Contract) CHÍNH THỨC
        active_contract = Contract.query.filter_by(user_id=user_id, status='active').order_by(Contract.contract_id.desc()).first()

        if active_contract:
            room = Room.query.get(active_contract.room_id)
            
            # =========================================================
            # TÌM HÓA ĐƠN MỚI NHẤT CỦA HỢP ĐỒNG NÀY TRONG DATABASE
            # =========================================================
            latest_bill = Bill.query.filter_by(contract_id=active_contract.contract_id).order_by(Bill.bill_id.desc()).first()
            
            # Gán giá trị mặc định nếu chưa có hóa đơn nào
            billing_data = { 
                "id": None, 
                "status": "paid", 
                "month": "Tháng này", 
                "amount": room.price if room else 0, 
                "dueDate": "--" 
            }
            
            # Nếu có hóa đơn thật, lấy dữ liệu thật đắp vào
            if latest_bill:
                billing_data = {
                    "id": latest_bill.bill_id,
                    "status": latest_bill.status,
                    "month": latest_bill.title, # Lấy title (vd: "Tiền phòng tháng 3")
                    "amount": latest_bill.amount,
                    "dueDate": latest_bill.due_date.strftime("%d/%m/%Y") if latest_bill.due_date else "--"
                }

            return jsonify({
                "hasRoom": True,
                "hasPendingRequest": False,
                "hasRejectedRequest": False,
                "studentName": student_name,
                "room": {
                    "name": room.room_name if room else "N/A",
                    "type": "Phòng Tiêu chuẩn" if room and room.price < 1500000 else "Phòng Dịch vụ",
                    "endDate": active_contract.end_date.strftime("%d/%m/%Y") if active_contract.end_date else "Chưa xác định"
                },
                # Nạp dữ liệu Hóa đơn thật vào đây
                "billing": billing_data,
                "maintenance": { "title": "Chưa có báo cáo sự cố", "date": "--", "status": "N/A" },
                "events": [
                    {"id": 1, "type": "info", "date": "18/03/2026", "title": "Thông báo: Vệ sinh định kỳ khu vực hành lang"}
                ]
            }), 200

        # 2. Kiểm tra Yêu cầu ĐANG CHỜ DUYỆT (pending)
        pending_request = RentalRequest.query.filter_by(user_id=user_id, status='pending').first()
        if pending_request:
            return jsonify({
                "hasRoom": False,
                "hasPendingRequest": True,
                "hasRejectedRequest": False,
                "studentName": student_name
            }), 200

        # 3. Kiểm tra Yêu cầu BỊ TỪ CHỐI (rejected)
        rejected_request = RentalRequest.query.filter_by(user_id=user_id, status='rejected').order_by(RentalRequest.request_id.desc()).first()
        if rejected_request:
            return jsonify({
                "hasRoom": False,
                "hasPendingRequest": False,
                "hasRejectedRequest": True,
                "studentName": student_name
            }), 200
            
        # 4. TRẠNG THÁI 1: Trống (Chọn phòng)
        all_rooms = Room.query.all()
        rooms_data = []
        for r in all_rooms:
            active_tenants = sum(1 for c in r.contracts if getattr(c, 'status', '') == 'active')
            if active_tenants < r.capacity:
                rooms_data.append({
                    'id': r.room_id,
                    'name': r.room_name,
                    'price': r.price,
                    'capacity': r.capacity,
                    'current_tenants': active_tenants,
                    'image_url': getattr(r, 'image_url', '')
                })
        
        return jsonify({
            "hasRoom": False,
            "hasPendingRequest": False,
            "hasRejectedRequest": False,
            "studentName": student_name,
            "availableRooms": rooms_data
        }), 200

    except Exception as e:
        print("❌ LỖI RỒI: ", str(e))
        return jsonify({"error": str(e)}), 500

# ... (Hàm request_room giữ nguyên) ...
def request_room():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        room_id = data.get('room_id')
        
        new_request = RentalRequest(
            user_id=user_id,
            room_id=room_id,
            status='pending'
        )
        db.session.add(new_request)
        db.session.commit()
        return jsonify({"message": "Đã gửi yêu cầu thuê phòng thành công!"}), 201
    except Exception as e:
        db.session.rollback()
        print("❌ LỖI GỬI YÊU CẦU: ", str(e))
        return jsonify({"error": str(e)}), 500