from flask import request, jsonify
from app.models.room_model import Room
from app.models.rental_model import Contract, RentalRequest, Bill 
from app.models.auth_model import User
from app.extensions import db
from datetime import datetime, timedelta

def get_student_dashboard(user_id):
    try:
        student = User.query.get(user_id)
        student_name = getattr(student, 'full_name', student.username) if student else 'Student'

        # 1. Check for ACTIVE Contract
        active_contract = Contract.query.filter_by(user_id=user_id, status='active').order_by(Contract.contract_id.desc()).first()

        if active_contract:
            room = Room.query.get(active_contract.room_id)
            
            # =========================================================
            # FIND THE LATEST BILL FOR THIS CONTRACT
            # =========================================================
            latest_bill = Bill.query.filter_by(contract_id=active_contract.contract_id).order_by(Bill.bill_id.desc()).first()
            
            # Default billing data if no bill exists yet
            billing_data = { 
                "id": None, 
                "status": "paid", 
                "month": "This Month", 
                "amount": room.price if room else 0, 
                "dueDate": "--" 
            }
            
            # If a real bill exists, populate the data
            if latest_bill:
                billing_data = {
                    "id": latest_bill.bill_id,
                    "status": latest_bill.status,
                    "month": latest_bill.title,
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
                    "type": "Standard Room" if room and room.price < 1500000 else "Service Room",
                    "endDate": active_contract.end_date.strftime("%d/%m/%Y") if active_contract.end_date else "Unspecified"
                },
                "billing": billing_data,
                "maintenance": { "title": "No maintenance reports", "date": "--", "status": "N/A" },
                "events": [
                    {"id": 1, "type": "info", "date": "18/03/2026", "title": "Notice: Routine corridor cleaning"}
                ]
            }), 200

        # 2. Check for PENDING Request
        pending_request = RentalRequest.query.filter_by(user_id=user_id, status='pending').first()
        if pending_request:
            return jsonify({
                "hasRoom": False,
                "hasPendingRequest": True,
                "hasRejectedRequest": False,
                "studentName": student_name
            }), 200

        # 3. Check for REJECTED Request
        rejected_request = RentalRequest.query.filter_by(user_id=user_id, status='rejected').order_by(RentalRequest.request_id.desc()).first()
        if rejected_request:
            return jsonify({
                "hasRoom": False,
                "hasPendingRequest": False,
                "hasRejectedRequest": True,
                "studentName": student_name
            }), 200
            
        # 4. STATUS: VACANT (Select Room)
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
        print("❌ ERROR: ", str(e))
        return jsonify({"error": str(e)}), 500

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
        return jsonify({"message": "Room rental request submitted successfully!"}), 201
    except Exception as e:
        db.session.rollback()
        print("❌ REQUEST SUBMISSION ERROR: ", str(e))
        return jsonify({"error": str(e)}), 500