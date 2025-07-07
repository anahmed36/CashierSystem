# backend/src/routes/reports.py

from flask import Blueprint, request, jsonify
from src.database import get_sales_report_data
from src.helpers import admin_required
from datetime import datetime, timedelta

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/reports/sales', methods=['GET'])
@admin_required
def sales_report():
    # Get date range from query parameters, default to the last 30 days
    today = datetime.now()
    end_date_str = request.args.get('end', today.strftime('%Y-%m-%d'))
    start_date_str = request.args.get('start', (today - timedelta(days=29)).strftime('%Y-%m-%d'))

    try:
        # Append time to dates to ensure the entire day is included in the query
        start_datetime = f"{start_date_str}T00:00:00"
        end_datetime = f"{end_date_str}T23:59:59.999"

        report_data = get_sales_report_data(start_datetime, end_datetime)
        return jsonify(report_data)

    except Exception as e:
        return jsonify({'message': f"Failed to generate report: {str(e)}"}), 500