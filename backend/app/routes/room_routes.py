from flask import Blueprint, request, jsonify
from app.controllers.room_controller import (
    add_room_logic, get_vacant_rooms_logic, add_device_logic, 
    update_device_status_logic, get_all_rooms_logic, update_room_logic, 
    delete_room_logic, get_all_devices_logic, update_device_logic, delete_device_logic
)
from app.controllers.auth_controller import require_role

room_bp = Blueprint('room', __name__)

@room_bp.route('', methods=['GET', 'POST', 'OPTIONS'], strict_slashes=False)
@require_role('admin', 'staff')
def handle_rooms():
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    if request.method == 'POST': return add_room_logic()
    return get_all_rooms_logic()

@room_bp.route('/<int:room_id>', methods=['PUT', 'DELETE', 'OPTIONS'], strict_slashes=False)
@require_role('admin', 'staff')
def handle_single_room(room_id):
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    if request.method == 'PUT': return update_room_logic(room_id)
    if request.method == 'DELETE': return delete_room_logic(room_id)

@room_bp.route('/vacant', methods=['GET', 'OPTIONS'], strict_slashes=False)
@require_role('admin', 'staff')
def handle_vacant_rooms():
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    return get_vacant_rooms_logic()

@room_bp.route('/devices', methods=['GET', 'POST', 'OPTIONS'], strict_slashes=False)
@require_role('admin', 'staff')
def handle_devices():
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    if request.method == 'POST': return add_device_logic()
    return get_all_devices_logic()

@room_bp.route('/devices/<int:device_id>', methods=['PUT', 'DELETE', 'OPTIONS'], strict_slashes=False)
@require_role('admin', 'staff')
def handle_single_device(device_id):
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    if request.method == 'PUT': return update_device_logic(device_id)
    if request.method == 'DELETE': return delete_device_logic(device_id)

@room_bp.route('/devices/<int:device_id>/status', methods=['PUT', 'OPTIONS'], strict_slashes=False)
@require_role('admin', 'staff')
def handle_device_status(device_id):
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    return update_device_status_logic(device_id)