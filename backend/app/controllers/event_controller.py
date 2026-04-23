from flask import request, jsonify
from app.extensions import db
from app.models.event_model import Event
import traceback
from datetime import datetime 

def get_all_events_logic():
    try:
        events = Event.query.order_by(Event.event_date.desc(), Event.created_at.desc()).all()
        result = []
        for e in events:
            # Fix an toàn định dạng ngày
            event_date_str = "N/A"
            if e.event_date:
                event_date_str = e.event_date.strftime('%Y-%m-%d') if hasattr(e.event_date, 'strftime') else str(e.event_date)
            
            result.append({
                'event_id': e.event_id,
                'title': e.title,
                'description': e.description,
                'type': e.type,
                'event_date': event_date_str,
                'status': getattr(e, 'status', 'active')
            })
        return jsonify(result), 200
    except Exception as e:
        print("--- GET EVENTS ERROR ---")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

def create_event_logic():
    try:
        data = request.get_json()
        date_str = data.get('event_date')
        parsed_date = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else None

        new_event = Event(
            title=data['title'],
            description=data['description'],
            type=data.get('type', 'info'),
            event_date=parsed_date
        )
        db.session.add(new_event)
        db.session.commit()
        return jsonify({'message': 'Event created successfully!'}), 201
    except Exception as e:
        db.session.rollback()
        print("--- CREATE EVENT ERROR ---")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

def delete_event_logic(event_id):
    try:
        event = Event.query.get_or_404(event_id)
        db.session.delete(event)
        db.session.commit()
        return jsonify({'message': 'Event deleted successfully!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500