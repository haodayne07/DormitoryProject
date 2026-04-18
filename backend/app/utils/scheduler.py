from app.extensions import db
from app.models.rental_model import Contract, Bill
from app.models.room_model import Room
from datetime import date
import traceback

def auto_generate_bills():
    """Hàm này sẽ tự động chạy vào ngày 1 hàng tháng (đã cài ở __init__.py)"""
    print("⏳ Đang chạy tác vụ tự động kiểm tra và tạo hóa đơn...")
    count = 0 # Đưa biến count ra ngoài try để dễ return
    try:
        today = date.today()
        current_month = today.month
        current_year = today.year
        
        # 1. Tìm tất cả các Hợp đồng đang có sinh viên ở (active)
        active_contracts = Contract.query.filter_by(status='active').all()
        
        for contract in active_contracts:
            title = f"Tiền phòng tháng {current_month}/{current_year}"
            
            # 2. Kiểm tra xem tháng này đã tạo hóa đơn cho hợp đồng này chưa để tránh tạo trùng
            existing_bill = Bill.query.filter_by(contract_id=contract.contract_id, title=title).first()
            
            if not existing_bill:
                room = Room.query.get(contract.room_id)
                room_price = getattr(room, 'price', 1500000) 
                
                # 3. Hạn chót đóng tiền là ngày 15 hàng tháng
                due_date = date(current_year, current_month, 15)
                
                new_bill = Bill(
                    contract_id=contract.contract_id,
                    title=title,
                    amount=room_price,
                    due_date=due_date,
                    status='unpaid'
                )
                db.session.add(new_bill)
                count += 1
                
        db.session.commit()
        print(f"✅ Đã tự động tạo thành công {count} hóa đơn cho tháng {current_month}!")
        return count # TRẢ VỀ SỐ LƯỢNG CHO API
    except Exception as e:
        db.session.rollback()
        print("❌ Lỗi khi tự động tạo hóa đơn:")
        traceback.print_exc()
        return 0