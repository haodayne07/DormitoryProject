from flask import Blueprint, request, jsonify
from app.controllers.contract_controller import (
    get_all_requests_logic,
    create_request_logic,
    process_request_logic,
    get_all_contracts_logic
)
from app.controllers.auth_controller import require_role

contract_bp = Blueprint('contract', __name__)

# ==================================================
# 1. API CHO YÊU CẦU THUÊ PHÒNG (REQUESTS)
# ==================================================
@contract_bp.route('/requests', methods=['GET', 'POST', 'OPTIONS'], strict_slashes=False)
@require_role('admin', 'staff')
def handle_requests():
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    if request.method == 'POST': return create_request_logic()
    return get_all_requests_logic()

@contract_bp.route('/requests/<int:request_id>', methods=['PUT', 'OPTIONS'], strict_slashes=False)
@require_role('admin', 'staff')
def handle_single_request(request_id):
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    return process_request_logic(request_id)

# ==================================================
# 2. API CHO HỢP ĐỒNG (CONTRACTS)
# ==================================================
@contract_bp.route('/', methods=['GET', 'OPTIONS'], strict_slashes=False)
@require_role('admin', 'staff')
def handle_contracts():
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    return get_all_contracts_logic()