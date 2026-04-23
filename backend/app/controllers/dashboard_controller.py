from flask import jsonify
from app.extensions import db
from app.models.auth_model import User 
from app.models.room_model import Room
from app.models.rental_model import Contract, RentalRequest, Payment
from sqlalchemy import func
import traceback
import calendar
from datetime import date

def get_dashboard_summary_logic():
    try:
        # 1. Count total students (users with 'student' role)
        total_students = User.query.filter_by(role='student').count()
        
        # 2. Room and capacity statistics
        total_rooms = Room.query.count() 
        total_capacity = db.session.query(func.sum(Room.capacity)).scalar() or 0
        
        # Count active resident students
        active_contracts = Contract.query.filter_by(status='active').count()
        
        # 3. Count pending room rental requests
        pending_requests = RentalRequest.query.filter_by(status='pending').count()
        
        # 4. Calculate total revenue
        total_revenue = db.session.query(func.sum(Payment.amount_paid)).scalar() or 0

        # ==========================================
        # CALCULATE CHART DATA (LAST 6 MONTHS)
        # ==========================================
        today = date.today()
        chart_data = []          # Data for occupancy chart
        revenue_chart_data = []  # Data for revenue chart
        
        # Retrieve all contracts and payments
        all_contracts = Contract.query.filter(Contract.start_date.isnot(None), Contract.end_date.isnot(None)).all()
        all_payments = Payment.query.all()

        for i in range(5, -1, -1): # Iterate backwards over the last 6 months
            m = today.month - i
            y = today.year
            while m <= 0:
                m += 12
                y -= 1
                
            start_of_month = date(y, m, 1)
            last_day = calendar.monthrange(y, m)[1]
            end_of_month = date(y, m, last_day)

            # --- Logic 1: Calculate active contracts (Occupancy Rate) ---
            active_in_month = sum(
                1 for c in all_contracts 
                if c.start_date <= end_of_month and c.end_date >= start_of_month
            )
            occupancy_rate = round((active_in_month / total_capacity) * 100) if total_capacity > 0 else 0
            
            # --- Logic 2: Calculate monthly revenue ---
            monthly_revenue = 0
            for p in all_payments:
                if p.payment_date:
                    # Safely cast to date type for comparison
                    p_date = p.payment_date.date() if hasattr(p.payment_date, 'date') else p.payment_date
                    if start_of_month <= p_date <= end_of_month:
                        monthly_revenue += p.amount_paid

            month_name = start_of_month.strftime('%b')

            chart_data.append({'name': month_name, 'value': occupancy_rate})
            revenue_chart_data.append({'name': month_name, 'value': monthly_revenue})
        
        return jsonify({
            'total_students': total_students,
            'total_rooms': total_rooms,
            'total_capacity': total_capacity,      
            'active_contracts': active_contracts,  
            'pending_requests': pending_requests,
            'total_revenue': total_revenue,
            'chart_data': chart_data,
            'revenue_chart_data': revenue_chart_data
        }), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500