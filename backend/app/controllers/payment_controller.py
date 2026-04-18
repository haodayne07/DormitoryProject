# from flask import request, jsonify
# from app.extensions import db
# from app.models.rental_model import Contract, Bill, Payment
# from app.models.auth_model import User
# from app.models.room_model import Room
# from datetime import datetime
# import traceback

# # --- CÁC THƯ VIỆN CHO MOMO ---
# import uuid
# import hmac
# import hashlib
# import requests

# # ==========================================
# # CẤU HÌNH MOMO SANDBOX (ĐÃ CẬP NHẬT BỘ KEY CHÍNH THỨC)
# # ==========================================
# MOMO_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create"

# # Bộ Key Sandbox 100% chuẩn từ MoMo Developer
# PARTNER_CODE = "MOMO" 
# ACCESS_KEY = "F8BBA842ECF85"
# SECRET_KEY = "K951B6PE1waDMi640xX08PD3vg6EkVlz"


# # ==========================================
# # PHẦN 1: LUỒNG THANH TOÁN THỦ CÔNG (ADMIN)
# # ==========================================

# def get_all_bills_logic():
#     try:
#         bills = Bill.query.order_by(
#             db.case({ 'unpaid': 0 }, value=Bill.status, else_=1),
#             Bill.due_date.desc()
#         ).all()
        
#         result = []
#         for b in bills:
#             contract = Contract.query.get(b.contract_id)
#             student = User.query.get(contract.user_id) if contract else None
#             room = Room.query.get(contract.room_id) if contract else None
            
#             result.append({
#                 'bill_id': b.bill_id,
#                 'title': b.title,
#                 'student_name': getattr(student, 'full_name', 'Unknown') if student else "Unknown",
#                 'room_name': room.room_name if room else "Unknown",
#                 'amount': b.amount,
#                 'due_date': b.due_date.strftime('%Y-%m-%d'),
#                 'status': b.status
#             })
#         return jsonify(result), 200
#     except Exception as e:
#         traceback.print_exc()
#         return jsonify({'error': str(e)}), 500

# def pay_bill_logic(bill_id):
#     try:
#         data = request.get_json()
#         method = data.get('method', 'Cash')
        
#         bill = Bill.query.get_or_404(bill_id)
#         if bill.status == 'paid':
#             return jsonify({'error': 'Already paid!'}), 400
            
#         bill.status = 'paid'
        
#         new_payment = Payment(
#             bill_id=bill.bill_id,
#             method=method,
#             amount_paid=bill.amount,
#             payment_date=datetime.utcnow()
#         )
#         db.session.add(new_payment)
#         db.session.commit()
        
#         return jsonify({'message': 'Success!'}), 200
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({'error': str(e)}), 500

# def get_payment_history_logic():
#     try:
#         payments = Payment.query.order_by(Payment.payment_date.desc()).all()
#         result = []
#         for p in payments:
#             bill = Bill.query.get(p.bill_id)
#             contract = Contract.query.get(bill.contract_id) if bill else None
#             student = User.query.get(contract.user_id) if contract else None
            
#             result.append({
#                 'payment_id': p.payment_id,
#                 'title': bill.title if bill else "Unknown",
#                 'student_name': getattr(student, 'full_name', 'Unknown') if student else "Unknown",
#                 'method': p.method,
#                 'amount_paid': p.amount_paid,
#                 'payment_date': p.payment_date.strftime('%Y-%m-%d %H:%M')
#             })
#         return jsonify(result), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500


# # ==========================================
# # PHẦN 2: LUỒNG MOMO (PAY WITH CREDIT CARD)
# # ==========================================

# def create_momo_payment_logic():
#     try:
#         data = request.get_json()
#         bill_id = data.get('bill_id')
        
#         bill = Bill.query.get_or_404(bill_id)
#         if bill.status == 'paid':
#             return jsonify({"error": "Bill already paid"}), 400
            
#         amount_int = int(bill.amount)
#         amount_str = str(amount_int)
        
#         order_info = f"Dormitory Payment for Bill {bill_id}"
#         order_id = f"{bill_id}_{str(uuid.uuid4())[:8]}"
#         request_id = str(uuid.uuid4())
        
#         redirect_url = "http://localhost:5173/student/dashboard" 
#         ipn_url = "https://momo.vn" 
#         extra_data = "" 
        
#         # Gọi thẳng giao diện nhập Thẻ Tín Dụng
#         request_type = "payWithCC" 

#         raw_signature = (
#             f"accessKey={ACCESS_KEY}&"
#             f"amount={amount_str}&"
#             f"extraData={extra_data}&"
#             f"ipnUrl={ipn_url}&"
#             f"orderId={order_id}&"
#             f"orderInfo={order_info}&"
#             f"partnerCode={PARTNER_CODE}&"
#             f"redirectUrl={redirect_url}&"
#             f"requestId={request_id}&"
#             f"requestType={request_type}"
#         )
        
#         signature = hmac.new(
#             SECRET_KEY.encode('utf-8'), 
#             raw_signature.encode('utf-8'), 
#             hashlib.sha256
#         ).hexdigest()

#         request_data = {
#             "partnerCode": PARTNER_CODE,
#             "partnerName": "DormHub",
#             "storeId": "DormHub_KTX",
#             "requestId": request_id,
#             "amount": amount_int,
#             "orderId": order_id,
#             "orderInfo": order_info,
#             "redirectUrl": redirect_url,
#             "ipnUrl": ipn_url,
#             "lang": "vi",
#             "extraData": extra_data,
#             "requestType": request_type,
#             "signature": signature
#         }

#         response = requests.post(MOMO_ENDPOINT, json=request_data)
#         res_data = response.json()

#         if res_data.get('resultCode') == 0:
#             return jsonify({"payUrl": res_data.get('payUrl')}), 200
#         else:
#             print("❌ MoMo Error Detail:", res_data)
#             return jsonify({"error": res_data.get('message')}), 400

#     except Exception as e:
#         print("❌ LỖI TẠO LINK MOMO: ", str(e))
#         traceback.print_exc()
#         return jsonify({"error": str(e)}), 500

# def momo_ipn_logic():
#     try:
#         data = request.get_json()
#         print("🔔 MOMO NOTIFICATION: ", data)
        
#         if data.get('resultCode') == 0:
#             order_id = data.get('orderId')
#             bill_id = int(order_id.split('_')[0])
#             amount_paid = float(data.get('amount'))

#             bill = Bill.query.get(bill_id)
#             if bill and bill.status != 'paid':
#                 bill.status = 'paid'
                
#                 new_payment = Payment(
#                     bill_id=bill.bill_id,
#                     method='MoMo Sandbox',
#                     amount_paid=amount_paid,
#                     payment_date=datetime.utcnow()
#                 )
#                 db.session.add(new_payment)
#                 db.session.commit()
#                 print(f"✅ AUTO-PAID FOR BILL {bill_id}")

#         return '', 204
#     except Exception as e:
#         db.session.rollback()
#         print("❌ IPN ERROR: ", str(e))
#         return jsonify({"error": str(e)}), 500

# # ==========================================
# # THÊM MỚI: XỬ LÝ KẾT QUẢ TRẢ VỀ TỪ MOMO (RETURN URL)
# # ==========================================
# def momo_return_logic():
#     try:
#         # Lấy các tham số MoMo truyền về trên URL
#         order_id = request.args.get('orderId')
#         result_code = request.args.get('resultCode')

#         # resultCode == '0' nghĩa là giao dịch thành công
#         if result_code == '0':
#             bill_id = int(order_id.split('_')[0])
#             bill = Bill.query.get(bill_id)
            
#             # Nếu hóa đơn chưa thanh toán thì mới cập nhật
#             if bill and bill.status != 'paid':
#                 bill.status = 'paid' # Chuyển trạng thái hóa đơn thành Đã thanh toán
                
#                 # Tạo lịch sử doanh thu cho Admin
#                 new_payment = Payment(
#                     bill_id=bill.bill_id,
#                     method='Chuyển khoản (MoMo)', # Ghi nhận phương thức chuyển khoản
#                     amount_paid=bill.amount,
#                     payment_date=datetime.utcnow()
#                 )
#                 db.session.add(new_payment)
#                 db.session.commit()
#                 return jsonify({"message": "Cập nhật thanh toán thành công!"}), 200
            
#             return jsonify({"message": "Hóa đơn đã được xử lý rồi."}), 200
#         else:
#             return jsonify({"error": "Giao dịch thất bại hoặc bị hủy"}), 400
            
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"error": str(e)}), 500

from flask import request, jsonify
from app.extensions import db
from app.models.rental_model import Contract, Bill, Payment
from app.models.auth_model import User
from app.models.room_model import Room
from datetime import datetime
from app.utils.scheduler import auto_generate_bills # Import hàm scheduler
import traceback

# --- CÁC THƯ VIỆN CHO MOMO ---
import uuid
import hmac
import hashlib
import requests

# ==========================================
# CẤU HÌNH MOMO SANDBOX (GIỮ NGUYÊN)
# ==========================================
MOMO_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create"
PARTNER_CODE = "MOMO" 
ACCESS_KEY = "F8BBA842ECF85"
SECRET_KEY = "K951B6PE1waDMi640xX08PD3vg6EkVlz"

# ==========================================
# PHẦN 1: LUỒNG THANH TOÁN & TẠO HÓA ĐƠN (ADMIN)
# ==========================================

def get_all_bills_logic():
    try:
        bills = Bill.query.order_by(
            db.case({ 'unpaid': 0 }, value=Bill.status, else_=1),
            Bill.due_date.desc()
        ).all()
        
        result = []
        for b in bills:
            contract = Contract.query.get(b.contract_id)
            student = User.query.get(contract.user_id) if contract else None
            room = Room.query.get(contract.room_id) if contract else None
            
            result.append({
                'bill_id': b.bill_id,
                'title': b.title,
                'student_name': getattr(student, 'full_name', 'Unknown') if student else "Unknown",
                'room_name': room.room_name if room else "Unknown",
                'amount': b.amount,
                'due_date': b.due_date.strftime('%Y-%m-%d'),
                'status': b.status
            })
        return jsonify(result), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

def pay_bill_logic(bill_id):
    try:
        data = request.get_json()
        method = data.get('method', 'Tiền mặt')
        
        bill = Bill.query.get_or_404(bill_id)
        if bill.status == 'paid':
            return jsonify({'error': 'Already paid!'}), 400
            
        bill.status = 'paid'
        new_payment = Payment(
            bill_id=bill.bill_id,
            method=method,
            amount_paid=bill.amount,
            payment_date=datetime.utcnow()
        )
        db.session.add(new_payment)
        db.session.commit()
        return jsonify({'message': 'Success!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def get_payment_history_logic():
    try:
        payments = Payment.query.order_by(Payment.payment_date.desc()).all()
        result = []
        for p in payments:
            bill = Bill.query.get(p.bill_id)
            contract = Contract.query.get(bill.contract_id) if bill else None
            student = User.query.get(contract.user_id) if contract else None
            
            result.append({
                'payment_id': p.payment_id,
                'title': bill.title if bill else "Unknown",
                'student_name': getattr(student, 'full_name', 'Unknown') if student else "Unknown",
                'method': p.method,
                'amount_paid': p.amount_paid,
                'payment_date': p.payment_date.strftime('%Y-%m-%d %H:%M')
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# BỔ SUNG: Tạo 1 hóa đơn thủ công
def create_single_bill_logic():
    try:
        data = request.get_json()
        due_date = datetime.strptime(data.get('due_date'), '%Y-%m-%d').date()
        new_bill = Bill(
            contract_id=data.get('contract_id'),
            title=data.get('title'),
            amount=data.get('amount'),
            due_date=due_date,
            status='unpaid'
        )
        db.session.add(new_bill)
        db.session.commit()
        return jsonify({'message': 'Tạo hóa đơn thành công!'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# BỔ SUNG: Phát hành hóa đơn hàng loạt (Gọi hàm từ scheduler)
def auto_generate_bills_api_logic():
    try:
        count = auto_generate_bills()
        return jsonify({'message': f'Đã phát hành hàng loạt {count} hóa đơn thành công!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==========================================
# PHẦN 2: LUỒNG MOMO (GIỮ NGUYÊN 100%)
# ==========================================

def create_momo_payment_logic():
    try:
        data = request.get_json()
        bill_id = data.get('bill_id')
        
        bill = Bill.query.get_or_404(bill_id)
        if bill.status == 'paid':
            return jsonify({"error": "Bill already paid"}), 400
            
        amount_int = int(bill.amount)
        amount_str = str(amount_int)
        
        order_info = f"Dormitory Payment for Bill {bill_id}"
        order_id = f"{bill_id}_{str(uuid.uuid4())[:8]}"
        request_id = str(uuid.uuid4())
        
        redirect_url = "http://localhost:5173/student/dashboard" 
        ipn_url = "https://momo.vn" 
        extra_data = "" 
        
        request_type = "payWithCC" 

        raw_signature = (
            f"accessKey={ACCESS_KEY}&"
            f"amount={amount_str}&"
            f"extraData={extra_data}&"
            f"ipnUrl={ipn_url}&"
            f"orderId={order_id}&"
            f"orderInfo={order_info}&"
            f"partnerCode={PARTNER_CODE}&"
            f"redirectUrl={redirect_url}&"
            f"requestId={request_id}&"
            f"requestType={request_type}"
        )
        
        signature = hmac.new(
            SECRET_KEY.encode('utf-8'), 
            raw_signature.encode('utf-8'), 
            hashlib.sha256
        ).hexdigest()

        request_data = {
            "partnerCode": PARTNER_CODE,
            "partnerName": "DormHub",
            "storeId": "DormHub_KTX",
            "requestId": request_id,
            "amount": amount_int,
            "orderId": order_id,
            "orderInfo": order_info,
            "redirectUrl": redirect_url,
            "ipnUrl": ipn_url,
            "lang": "vi",
            "extraData": extra_data,
            "requestType": request_type,
            "signature": signature
        }

        response = requests.post(MOMO_ENDPOINT, json=request_data)
        res_data = response.json()

        if res_data.get('resultCode') == 0:
            return jsonify({"payUrl": res_data.get('payUrl')}), 200
        else:
            print("❌ MoMo Error Detail:", res_data)
            return jsonify({"error": res_data.get('message')}), 400

    except Exception as e:
        print("❌ LỖI TẠO LINK MOMO: ", str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def momo_ipn_logic():
    try:
        data = request.get_json()
        print("🔔 MOMO NOTIFICATION: ", data)
        
        if data.get('resultCode') == 0:
            order_id = data.get('orderId')
            bill_id = int(order_id.split('_')[0])
            amount_paid = float(data.get('amount'))

            bill = Bill.query.get(bill_id)
            if bill and bill.status != 'paid':
                bill.status = 'paid'
                
                new_payment = Payment(
                    bill_id=bill.bill_id,
                    method='MoMo Sandbox',
                    amount_paid=amount_paid,
                    payment_date=datetime.utcnow()
                )
                db.session.add(new_payment)
                db.session.commit()
                print(f"✅ AUTO-PAID FOR BILL {bill_id}")

        return '', 204
    except Exception as e:
        db.session.rollback()
        print("❌ IPN ERROR: ", str(e))
        return jsonify({"error": str(e)}), 500

def momo_return_logic():
    try:
        order_id = request.args.get('orderId')
        result_code = request.args.get('resultCode')

        if result_code == '0':
            bill_id = int(order_id.split('_')[0])
            bill = Bill.query.get(bill_id)
            
            if bill and bill.status != 'paid':
                bill.status = 'paid' 
                
                new_payment = Payment(
                    bill_id=bill.bill_id,
                    method='Chuyển khoản (MoMo)', 
                    amount_paid=bill.amount,
                    payment_date=datetime.utcnow()
                )
                db.session.add(new_payment)
                db.session.commit()
                return jsonify({"message": "Cập nhật thanh toán thành công!"}), 200
            
            return jsonify({"message": "Hóa đơn đã được xử lý rồi."}), 200
        else:
            return jsonify({"error": "Giao dịch thất bại hoặc bị hủy"}), 400
            
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500