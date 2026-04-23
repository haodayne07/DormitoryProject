from app.extensions import db
from app.models.rental_model import Contract, Bill
from app.models.room_model import Room
from datetime import date
import traceback

def auto_generate_bills():
    """This function will run automatically on the 1st of every month (configured in __init__.py)"""
    print("⏳ Running automated task to check and generate bills...")
    count = 0 
    try:
        today = date.today()
        current_month = today.month
        current_year = today.year
        
      
        active_contracts = Contract.query.filter_by(status='active').all()
        
        for contract in active_contracts:
            title = f"Room Fee Month {current_month}/{current_year}"
            
            
            existing_bill = Bill.query.filter_by(contract_id=contract.contract_id, title=title).first()
            
            if not existing_bill:
                room = Room.query.get(contract.room_id)
                room_price = getattr(room, 'price', 1500000) 
                
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
        print(f"✅ Successfully auto-generated {count} bills for month {current_month}!")
        return count 
    except Exception as e:
        db.session.rollback()
        print("❌ Error during auto-generation of bills:")
        traceback.print_exc()
        return 0