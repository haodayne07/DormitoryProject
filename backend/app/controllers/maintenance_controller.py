from flask import request, jsonify
from datetime import datetime
from app.models.rental_model import MaintenanceHistory
from app.extensions import db
from app.models.room_model import Device, Room 
from app.models.auth_model import User 
import traceback

# RM-6: Student submits a maintenance request
def report_issue_logic():
    data = request.get_json()
    new_report = MaintenanceHistory(
        user_id=data['user_id'],
        devices_id=data.get('devices_id'),
        note=data['note'],
        date_maintenance=datetime.utcnow(),
        devices_status='pending'
    )
    db.session.add(new_report)
    db.session.commit()
    return jsonify({'message': 'Maintenance request submitted successfully!'}), 201

# =======================================================
# RM-6: ADMIN VIEW LIST (CRASH-PROOF VERSION)
# =======================================================
def get_all_issues_logic():
    try:
        # Sort by latest ID for safety
        issues = MaintenanceHistory.query.order_by(MaintenanceHistory.maintenance_id.desc()).all()
        result = []
        for i in issues:
            # 1. Try-except for Student Name
            student_name = "Anonymous Student"
            try:
                if i.user_id:
                    student = User.query.get(i.user_id)
                    if student:
                        student_name = getattr(student, 'full_name', student.username)
            except: pass

            # 2. Try-except for Device & Room Name
            device_name = "Unknown Device"
            room_name = "Unknown Room"
            try:
                if i.devices_id:
                    device = Device.query.get(i.devices_id)
                    if device:
                        device_name = device.devices_name
                        if device.room_id:
                            room = Room.query.get(device.room_id)
                            if room:
                                room_name = room.room_name
            except: pass

            # 3. Try-except for Date formatting
            date_str = "N/A"
            try:
                if i.date_maintenance:
                    date_str = i.date_maintenance.strftime('%d/%m/%Y %H:%M')
            except: pass

            result.append({
                'id': i.maintenance_id,
                'student_name': student_name,
                'room_name': room_name,
                'device_name': device_name,
                'note': i.note,
                'description': i.note if i.note else "No description provided",
                'status': i.devices_status if i.devices_status else 'pending',
                'date': date_str
            })
        return jsonify(result), 200
    except Exception as e:
        print("--- BACKEND ERROR GET ALL MAINTENANCE ---")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# =======================================================
# ADMIN UPDATE ISSUE STATUS
# =======================================================
def update_issue_status_logic(issue_id):
    try:
        data = request.json
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({'error': 'Missing update status'}), 400
            
        history = MaintenanceHistory.query.get(issue_id)
        if not history:
            return jsonify({'error': 'Request not found'}), 404
            
        history.devices_status = new_status
        
        # Sync device status
        if new_status == 'completed' and history.devices_id:
            device = Device.query.get(history.devices_id)
            if device:
                device.status = 'good'
                
        elif new_status in ['pending', 'processing'] and history.devices_id:
            device = Device.query.get(history.devices_id)
            if device:
                device.status = 'broken'
                
        db.session.commit()
        return jsonify({'message': 'Status updated successfully!'}), 200
        
    except Exception as e:
        db.session.rollback()
        print("--- BACKEND ERROR UPDATE MAINTENANCE STATUS ---")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500