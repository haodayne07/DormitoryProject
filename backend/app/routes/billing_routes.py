from flask import Blueprint
# Nhớ import thêm hàm auto_generate_monthly_bills_logic
from app.controllers.billing_controller import create_bill_logic, process_payment_logic, auto_generate_monthly_bills_logic

billing_bp = Blueprint('billing', __name__)

billing_bp.route('/create', methods=['POST'])(create_bill_logic)
billing_bp.route('/pay', methods=['POST'])(process_payment_logic)
# Thêm đường dẫn cho tính năng quét hàng loạt
billing_bp.route('/auto-generate', methods=['POST'])(auto_generate_monthly_bills_logic)