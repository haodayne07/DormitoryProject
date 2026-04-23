from flask import request, jsonify
from app.models.rental_model import Bill, Payment, Contract
from app.models.room_model import Room
from app.extensions import db
from datetime import datetime

def create_bill_logic():
    try:
        data = request.get_json()
        contract_id = data['contract_id']
        title = data['title']
        
        existing_bill = Bill.query.filter_by(contract_id=contract_id, title=title).first()
        if existing_bill:
            return jsonify({'error': f'Bill "{title}" already exists! Cannot create duplicate.'}), 400

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
        return jsonify({'message': 'Bill created successfully!'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def process_payment_logic():
    try:
        data = request.get_json()
        bill = Bill.query.get_or_404(data['bill_id'])
        
        new_payment = Payment(
            bill_id=bill.bill_id,
            method=data.get('method', 'cash'),
            amount_paid=data['amount_paid'],
            payment_date=datetime.utcnow()
        )
        
        if data['amount_paid'] >= bill.amount:
            bill.status = 'paid'
            
        db.session.add(new_payment)
        db.session.commit()
        return jsonify({'message': 'Payment successful!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def auto_generate_monthly_bills_logic():
    try:
        active_contracts = Contract.query.filter(Contract.status.in_(['active', 'Approved'])).all()
        
        today = datetime.now()
        current_month_str = f"{today.month:02d}/{today.year}"
        title = f"Dormitory Fee - Month {current_month_str}" 
        
        if today.month == 12:
            next_month, next_year = 1, today.year + 1
        else:
            next_month, next_year = today.month + 1, today.year
        due_date = datetime(next_year, next_month, 5).date()

        created_count = 0
        
        for contract in active_contracts:
            existing = Bill.query.filter_by(contract_id=contract.contract_id, title=title).first()
            if not existing:
                room = Room.query.get(contract.room_id)
                price = room.price if room else 1500000

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
        return jsonify({'message': f'Scan successful! Issued {created_count} new bills for month {current_month_str}.'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500