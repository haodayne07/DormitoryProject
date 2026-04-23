from flask import Blueprint, request, jsonify
from app.controllers.admin_controller import get_occupancy_stats_logic, get_revenue_report_logic
from app.controllers.auth_controller import (
    get_all_staff_logic, create_staff_logic, update_staff_logic, delete_staff_logic, require_role
)

admin_bp = Blueprint('admin', __name__)

admin_bp.route('/stats', methods=['GET'])(get_occupancy_stats_logic)
admin_bp.route('/revenue', methods=['GET'])(get_revenue_report_logic)


@admin_bp.route('/staff', methods=['GET', 'POST', 'OPTIONS'], strict_slashes=False)
@require_role('admin')
def handle_staff():
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    if request.method == 'POST': return create_staff_logic()
    return get_all_staff_logic()

@admin_bp.route('/staff/<int:staff_id>', methods=['PUT', 'DELETE', 'OPTIONS'], strict_slashes=False)
@require_role('admin')
def handle_single_staff(staff_id):
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    if request.method == 'PUT': return update_staff_logic(staff_id)
    if request.method == 'DELETE': return delete_staff_logic(staff_id)