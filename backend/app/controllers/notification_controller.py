from datetime import datetime, time

from flask import jsonify, request

from app.models.event_model import Event
from app.models.rental_model import Bill, Contract, MaintenanceHistory, Payment, RentalRequest
from app.models.room_model import Room
from app.models.auth_model import User


ADMIN_ROLES = {'admin', 'staff'}


def _student_name(user):
    if not user:
        return 'Unknown student'
    return getattr(user, 'full_name', None) or user.username or 'Unknown student'


def _date_label(value):
    if not value:
        return 'Recently'
    if hasattr(value, 'strftime'):
        if hasattr(value, 'hour'):
            return value.strftime('%Y-%m-%d %H:%M')
        return value.strftime('%Y-%m-%d')
    return str(value)


def _sort_value(value, fallback_rank=0, fallback_days=1):
    if value:
        if isinstance(value, datetime):
            return value.timestamp()
        if hasattr(value, 'year'):
            return datetime.combine(value, time.min).timestamp()

    return datetime.utcnow().timestamp() - (fallback_days * 86400) + (fallback_rank / 1000)


def _add_notification(items, *, key, title, description, type='info', source='system',
                      date_value=None, fallback_rank=0, fallback_days=1, link=''):
    items.append({
        'key': key,
        'title': title,
        'description': description,
        'type': type,
        'source': source,
        'date_label': _date_label(date_value),
        'created_at': _date_label(date_value),
        'link': link,
        '_sort': _sort_value(date_value, fallback_rank, fallback_days)
    })


def get_notifications_logic():
    try:
        role = (request.args.get('role') or 'student').strip().lower()
        user_id = request.args.get('user_id', type=int)
        is_admin = role in ADMIN_ROLES
        notifications = []

        admin_event_link = '/admin/events' if is_admin else '/student/events'
        for event in Event.query.order_by(Event.created_at.desc(), Event.event_date.desc()).limit(20).all():
            if getattr(event, 'status', 'active') == 'inactive':
                continue
            _add_notification(
                notifications,
                key=f'event-{event.event_id}',
                title=event.title,
                description=event.description,
                type=event.type or 'info',
                source='event',
                date_value=event.created_at or event.event_date,
                link=admin_event_link
            )

        if is_admin:
            _append_admin_notifications(notifications)
        elif user_id:
            _append_student_notifications(notifications, user_id)

        notifications.sort(key=lambda item: item['_sort'], reverse=True)
        result = []
        seen_keys = set()
        for item in notifications:
            if item['key'] in seen_keys:
                continue
            seen_keys.add(item['key'])
            item.pop('_sort', None)
            result.append(item)

        return jsonify(result[:25]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def _append_admin_notifications(notifications):
    requests = RentalRequest.query.order_by(RentalRequest.created_at.desc(), RentalRequest.request_id.desc()).limit(10).all()
    for rental_request in requests:
        student = User.query.get(rental_request.user_id)
        room = Room.query.get(rental_request.room_id)
        status_text = rental_request.status or 'pending'
        _add_notification(
            notifications,
            key=f'rental-request-{rental_request.request_id}-{status_text}',
            title='Room request submitted' if status_text == 'pending' else 'Room request updated',
            description=f"{_student_name(student)} requested {room.room_name if room else 'Unknown room'} ({status_text}).",
            type='contract',
            source='contract',
            date_value=rental_request.created_at,
            link='/admin/contracts'
        )

    rooms = Room.query.order_by(Room.room_id.desc()).limit(5).all()
    for room in rooms:
        _add_notification(
            notifications,
            key=f'room-{room.room_id}',
            title='Room added',
            description=f"{room.room_name} is available for {room.capacity} student(s) at {float(room.price):,.0f} VND.",
            type='room',
            source='room',
            fallback_rank=room.room_id,
            fallback_days=1,
            link='/admin/rooms'
        )

    issues = MaintenanceHistory.query.order_by(
        MaintenanceHistory.date_maintenance.desc(),
        MaintenanceHistory.maintenance_id.desc()
    ).limit(10).all()
    for issue in issues:
        student = User.query.get(issue.user_id)
        _add_notification(
            notifications,
            key=f'maintenance-{issue.maintenance_id}-{issue.devices_status or "pending"}',
            title='Maintenance request',
            description=f"{_student_name(student)} reported: {issue.note or 'No details provided'}",
            type='maintenance',
            source='maintenance',
            date_value=issue.date_maintenance,
            link='/admin/maintenance'
        )

    payments = Payment.query.order_by(Payment.payment_date.desc(), Payment.payment_id.desc()).limit(10).all()
    for payment in payments:
        bill = Bill.query.get(payment.bill_id)
        contract = Contract.query.get(bill.contract_id) if bill else None
        student = User.query.get(contract.user_id) if contract else None
        _add_notification(
            notifications,
            key=f'payment-{payment.payment_id}',
            title='Payment received',
            description=f"{_student_name(student)} paid {float(payment.amount_paid):,.0f} VND for {bill.title if bill else 'a bill'}.",
            type='payment',
            source='payment',
            date_value=payment.payment_date,
            link='/admin/payments'
        )

    bills = Bill.query.filter_by(status='unpaid').order_by(Bill.due_date.asc(), Bill.bill_id.desc()).limit(10).all()
    for bill in bills:
        contract = Contract.query.get(bill.contract_id)
        student = User.query.get(contract.user_id) if contract else None
        _add_notification(
            notifications,
            key=f'bill-{bill.bill_id}-unpaid',
            title='Unpaid bill',
            description=f"{_student_name(student)} has an unpaid bill: {bill.title}.",
            type='payment',
            source='payment',
            date_value=bill.due_date,
            link='/admin/payments'
        )


def _append_student_notifications(notifications, user_id):
    contracts = Contract.query.filter_by(user_id=user_id).all()
    contract_ids = [contract.contract_id for contract in contracts]

    requests = RentalRequest.query.filter_by(user_id=user_id).order_by(
        RentalRequest.created_at.desc(),
        RentalRequest.request_id.desc()
    ).limit(5).all()
    for rental_request in requests:
        room = Room.query.get(rental_request.room_id)
        status_text = rental_request.status or 'pending'
        _add_notification(
            notifications,
            key=f'my-request-{rental_request.request_id}-{status_text}',
            title='Room request status',
            description=f"Your request for {room.room_name if room else 'Unknown room'} is {status_text}.",
            type='contract',
            source='contract',
            date_value=rental_request.created_at,
            link='/student/dashboard'
        )

    if contract_ids:
        bills = Bill.query.filter(Bill.contract_id.in_(contract_ids)).order_by(Bill.due_date.desc(), Bill.bill_id.desc()).limit(10).all()
        for bill in bills:
            _add_notification(
                notifications,
                key=f'my-bill-{bill.bill_id}-{bill.status}',
                title='Bill update',
                description=f"{bill.title} is {bill.status}. Amount: {float(bill.amount):,.0f} VND.",
                type='payment',
                source='payment',
                date_value=bill.due_date,
                link='/student/payments'
            )

        payments = Payment.query.join(Bill).filter(Bill.contract_id.in_(contract_ids)).order_by(
            Payment.payment_date.desc(),
            Payment.payment_id.desc()
        ).limit(5).all()
        for payment in payments:
            bill = Bill.query.get(payment.bill_id)
            _add_notification(
                notifications,
                key=f'my-payment-{payment.payment_id}',
                title='Payment completed',
                description=f"Payment for {bill.title if bill else 'your bill'} was recorded successfully.",
                type='payment',
                source='payment',
                date_value=payment.payment_date,
                link='/student/payments'
            )

    issues = MaintenanceHistory.query.filter_by(user_id=user_id).order_by(
        MaintenanceHistory.date_maintenance.desc(),
        MaintenanceHistory.maintenance_id.desc()
    ).limit(5).all()
    for issue in issues:
        _add_notification(
            notifications,
            key=f'my-maintenance-{issue.maintenance_id}-{issue.devices_status or "pending"}',
            title='Maintenance status',
            description=f"Your maintenance request is {issue.devices_status or 'pending'}.",
            type='maintenance',
            source='maintenance',
            date_value=issue.date_maintenance,
            link='/student/maintenance'
        )

    rooms = Room.query.filter(Room.status.in_(['vacant', 'available', 'Vacant'])).order_by(Room.room_id.desc()).limit(5).all()
    for room in rooms:
        _add_notification(
            notifications,
            key=f'available-room-{room.room_id}',
            title='Available room',
            description=f"{room.room_name} is available for registration.",
            type='room',
            source='room',
            fallback_rank=room.room_id,
            fallback_days=2,
            link='/student/dashboard'
        )
