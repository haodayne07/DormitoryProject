from flask import Blueprint
from app.controllers.event_controller import get_all_events_logic, create_event_logic, delete_event_logic

event_bp = Blueprint('event', __name__)

event_bp.route('', methods=['GET'], strict_slashes=False)(get_all_events_logic)
event_bp.route('', methods=['POST'], strict_slashes=False)(create_event_logic)
event_bp.route('/<int:event_id>', methods=['DELETE'], strict_slashes=False)(delete_event_logic)