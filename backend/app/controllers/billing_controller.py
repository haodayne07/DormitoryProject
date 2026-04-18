from flask import request, jsonify
# Thêm import Contract và Room để lấy thông tin hợp đồng tự động
from app.models.rental_model import Bill, Payment, Contract
from app.models.room_model import Room
from app.extensions import db
from datetime import datetime

# RM-12: Tạo hóa đơn mới (Tính toán tiền phòng/điện/nước) - GIỮ NGUYÊN VÀ THÊM CHECK TRÙNG LẶP
def create_bill_logic():
    try:
        data = request.get_json()
        contract_id = data['contract_id']
        title = data['title']
        
        # KIỂM TRA TRÙNG LẶP: Nếu đã có hóa đơn cùng title cho hợp đồng này thì chặn lại
        existing_bill = Bill.query.filter_by(contract_id=contract_id, title=title).first()
        if existing_bill:
            return jsonify({'error': f'Hóa đơn "{title}" đã tồn tại! Không thể tạo trùng.'}), 400

        due_date_str = data['due_date']
        due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date() if isinstance(due_date_str, str) else due_date_str

        new_bill = Bill(
            contract_id=contract_id,
            title=title,
            amount=data['amount'],
            due_date=due_date,
            status='unpaid'
        )
        db.session.add(new_bill)
        db.session.commit()
        return jsonify({'message': 'Tạo hóa đơn thành công!'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# RM-13: Ghi nhận thanh toán và in biên lai (Logic) - GIỮ NGUYÊN 100%
def process_payment_logic():
    try:
        data = request.get_json()
        bill = Bill.query.get_or_404(data['bill_id'])
        
        # Ghi nhận giao dịch
        new_payment = Payment(
            bill_id=bill.bill_id,
            method=data.get('method', 'cash'),
            amount_paid=data['amount_paid'],
            payment_date=datetime.utcnow()
        )
        
        # Cập nhật trạng thái hóa đơn nếu trả đủ
        if data['amount_paid'] >= bill.amount:
            bill.status = 'paid'
            
        db.session.add(new_payment)
        db.session.commit()
        return jsonify({'message': 'Thanh toán thành công!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ========================================================
# THÊM MỚI: API TỰ ĐỘNG QUÉT VÀ PHÁT HÀNH HÓA ĐƠN HÀNG LOẠT
# ========================================================
def auto_generate_monthly_bills_logic():
    try:
        # Lấy tất cả hợp đồng đang Active hoặc Approved
        active_contracts = Contract.query.filter(Contract.status.in_(['active', 'Approved'])).all()
        
        today = datetime.now()
        # Định dạng MM/YYYY (VD: 04/2026)
        current_month_str = f"{today.month:02d}/{today.year}"
        title = f"Tien phong KTX thang {current_month_str}" # Dùng tiếng Anh không dấu cho an toàn MoMo
        
        # Hạn chót thanh toán: Mặc định là ngày 5 của tháng tiếp theo
        if today.month == 12:
            next_month, next_year = 1, today.year + 1
        else:
            next_month, next_year = today.month + 1, today.year
        due_date = datetime(next_year, next_month, 5).date()

        created_count = 0
        
        for contract in active_contracts:
            # Thuật toán thông minh: Chỉ tạo nếu tháng này chưa có hóa đơn (CHỐNG TRÙNG)
            existing = Bill.query.filter_by(contract_id=contract.contract_id, title=title).first()
            if not existing:
                room = Room.query.get(contract.room_id)
                price = room.price if room else 1500000 # Lấy giá phòng mặc định

                new_bill = Bill(
                    contract_id=contract.contract_id,
                    title=title,
                    amount=price,
                    due_date=due_date,
                    status='unpaid'
                )
                db.session.add(new_bill)
                created_count += 1
        
        db.session.commit()
        return jsonify({'message': f'Quét thành công! Đã phát hành {created_count} hóa đơn mới cho tháng {current_month_str}.'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500