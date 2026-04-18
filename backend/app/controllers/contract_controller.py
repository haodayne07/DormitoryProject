from flask import request, jsonify
from app.extensions import db
from app.models.rental_model import Contract, RentalRequest
from app.models.auth_model import User # ĐÃ FIX: Đổi từ user_model sang auth_model
from app.models.room_model import Room
from datetime import datetime
import traceback

# ==========================================
# PHẦN 1: QUẢN LÝ YÊU CẦU THUÊ PHÒNG (REQUESTS)
# ==========================================

def get_all_requests_logic():
    try:
        requests = RentalRequest.query.order_by(
            db.case({ 'pending': 0 }, value=RentalRequest.status, else_=1),
            RentalRequest.created_at.desc()
        ).all()
        
        result = []
        for req in requests:
            student = User.query.get(req.user_id)
            room = Room.query.get(req.room_id)
            result.append({
                'request_id': req.request_id,
                'user_id': req.user_id,
                'student_name': student.full_name or student.username if student else "Không xác định",
                'room_id': req.room_id,
                'room_name': room.room_name if room else "Không xác định",
                'created_at': req.created_at.strftime('%Y-%m-%d %H:%M') if req.created_at else "",
                'status': req.status
            })
        return jsonify(result), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

def create_request_logic():
    try:
        data = request.get_json()
        
        existing_req = RentalRequest.query.filter_by(user_id=data['user_id'], room_id=data['room_id'], status='pending').first()
        if existing_req:
            return jsonify({'error': 'Bạn đã gửi yêu cầu cho phòng này rồi, vui lòng chờ duyệt!'}), 400
            
        new_req = RentalRequest(
            user_id=data['user_id'],
            room_id=data['room_id']
        )
        db.session.add(new_req)
        db.session.commit()
        return jsonify({'message': 'Gửi yêu cầu thuê phòng thành công!'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

def process_request_logic(request_id):
    try:
        data = request.get_json()
        action = data.get('action') 
        
        req = RentalRequest.query.get_or_404(request_id)
        
        if req.status != 'pending':
            return jsonify({'error': 'Yêu cầu này đã được xử lý từ trước!'}), 400
            
        if action == 'reject':
            req.status = 'rejected'
            db.session.commit()
            return jsonify({'message': 'Đã từ chối yêu cầu thuê phòng!'}), 200
            
        elif action == 'approve':
            # BƯỚC 1: KIỂM TRA SỨC CHỨA CỦA PHÒNG TRƯỚC KHI DUYỆT
            room = Room.query.get(req.room_id)
            if not room:
                return jsonify({'error': 'Phòng không tồn tại!'}), 404
                
            current_occupancy = Contract.query.filter_by(room_id=room.room_id, status='active').count()
            if current_occupancy >= room.capacity:
                return jsonify({'error': f'Phòng {room.room_name} đã đầy ({current_occupancy}/{room.capacity}), không thể duyệt thêm!'}), 400

            # BƯỚC 2: NẾU CÒN CHỖ THÌ DUYỆT VÀ TẠO HỢP ĐỒNG
            req.status = 'approved'
            start_date = datetime.strptime(data.get('start_date'), '%Y-%m-%d').date()
            end_date = datetime.strptime(data.get('end_date'), '%Y-%m-%d').date()
            
            new_contract = Contract(
                user_id=req.user_id,
                room_id=req.room_id,
                start_date=start_date,
                end_date=end_date,
                deposit_amount=data.get('deposit_amount', 0),
                status='active'
            )
            db.session.add(new_contract)
            db.session.commit()
            
            return jsonify({'message': 'Đã duyệt yêu cầu và tạo Hợp đồng thành công!'}), 200
            
        return jsonify({'error': 'Hành động không hợp lệ!'}), 400
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400


# ==========================================
# PHẦN 2: QUẢN LÝ HỢP ĐỒNG (CONTRACTS)
# ==========================================

def get_all_contracts_logic():
    try:
        contracts = Contract.query.order_by(Contract.start_date.desc()).all()
        result = []
        for c in contracts:
            student = User.query.get(c.user_id)
            room = Room.query.get(c.room_id)
            result.append({
                'contract_id': c.contract_id,
                'user_id': c.user_id,
                'student_name': student.full_name or student.username if student else "Không xác định",
                'room_id': c.room_id,
                'room_name': room.room_name if room else "Không xác định",
                'start_date': c.start_date.strftime('%Y-%m-%d') if c.start_date else "",
                'end_date': c.end_date.strftime('%Y-%m-%d') if c.end_date else "",
                'deposit_amount': float(c.deposit_amount) if c.deposit_amount else 0,
                'status': c.status
            })
        return jsonify(result), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500