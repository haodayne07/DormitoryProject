from flask import Blueprint, request, jsonify
from app.controllers.dashboard_controller import get_dashboard_summary_logic
from app.controllers.auth_controller import require_role

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/summary', methods=['GET', 'OPTIONS'], strict_slashes=False)
@require_role('admin', 'staff')
def handle_dashboard_summary():
    if request.method == 'OPTIONS': 
        return jsonify({'status': 'ok'}), 200
    return get_dashboard_summary_logic()