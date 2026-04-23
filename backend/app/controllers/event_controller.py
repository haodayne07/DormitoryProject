from flask import request, jsonify
from app.extensions import db
from app.models.event_model import Event
import traceback

def get_all_events_logic():
    try:
        events = Event.query.order_by(Event.event_date.desc(), Event.created_at.desc()).all()
        result = [{
            'event_id': e.event_id,
            'title': e.title,
            'description': e.description,
            'type': e.type,
            'event_date': e.event_date.strftime('%Y-%m-%d'),
            'status': e.status
        } for e in events]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def create_event_logic():
    try:
        data = request.get_json()
        new_event = Event(
            title=data['title'],
            description=data['description'],
            type=data.get('type', 'info'),
            event_date=data['event_date']
        )
        db.session.add(new_event)
        db.session.commit()
        return jsonify({'message': 'Event created successfully!'}), 201
    except Exception as e:
        db.session.rollback()
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