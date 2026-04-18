from run import app
from app.extensions import db
from app.models.rental_model import Contract, Bill
from datetime import datetime, timedelta

with app.app_context():
    # 1. Tìm 1 hợp đồng bất kỳ đang có hiệu lực (active)
    contract = Contract.query.filter_by(status='active').first()

    if not contract:
        print("❌ LỖI: Không tìm thấy Hợp đồng nào đang active!")
        print("👉 Hướng giải quyết: Hãy đăng nhập Admin và 'Duyệt' một yêu cầu thuê phòng trước nhé.")
    else:
        # 2. Tạo Hóa đơn (Bill) mới cho hợp đồng này
        new_bill = Bill(
            contract_id=contract.contract_id,
            title="Tiền phòng KTX tháng 03/2026",
            amount=1500000, # 1.500.000 VNĐ
            due_date=datetime.utcnow().date() + timedelta(days=5), # Hạn chót 5 ngày nữa
            status='unpaid'
        )
        db.session.add(new_bill)
        db.session.commit()
        
        print(f"✅ THÀNH CÔNG! Đã tạo Hóa đơn (bill_id = {new_bill.bill_id}) cho Hợp đồng (contract_id = {contract.contract_id})")