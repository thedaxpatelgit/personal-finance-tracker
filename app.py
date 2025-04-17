from flask import Flask, render_template, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)

# Path for the transactions data file
TRANSACTIONS_FILE = 'transactions.json'

# Initialize transactions file if it doesn't exist
def initialize_transactions_file():
    if not os.path.exists(TRANSACTIONS_FILE):
        with open(TRANSACTIONS_FILE, 'w') as f:
            json.dump([], f)

# Load transactions from file
def load_transactions():
    initialize_transactions_file()
    try:
        with open(TRANSACTIONS_FILE, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        # If the file is empty or corrupted, return an empty list
        return []

# Save transactions to file
def save_transactions(transactions):
    with open(TRANSACTIONS_FILE, 'w') as f:
        json.dump(transactions, f, indent=4)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/transactions', methods=['GET'])
def get_transactions():
    transactions = load_transactions()
    
    # Get filter parameters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    category = request.args.get('category')
    transaction_type = request.args.get('type')
    
    # Apply filters if they exist
    filtered_transactions = transactions
    
    if start_date:
        filtered_transactions = [t for t in filtered_transactions if t['date'] >= start_date]
    
    if end_date:
        filtered_transactions = [t for t in filtered_transactions if t['date'] <= end_date]
    
    if category and category != 'all':
        filtered_transactions = [t for t in filtered_transactions if t['category'] == category]
    
    if transaction_type and transaction_type != 'all':
        filtered_transactions = [t for t in filtered_transactions if t['type'] == transaction_type]
    
    return jsonify(filtered_transactions)

@app.route('/transactions', methods=['POST'])
def add_transaction():
    # Get transaction data from request
    data = request.json
    
    # Validate input
    if not data or 'title' not in data or 'amount' not in data or 'date' not in data:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    try:
        # Convert amount to float
        amount = float(data['amount'])
        
        # Create transaction object
        transaction = {
            'id': datetime.now().timestamp(),  # Simple unique ID
            'title': data['title'],
            'amount': amount,
            'type': data.get('type', 'income' if amount >= 0 else 'expense'),
            'category': data.get('category', 'Other Income' if amount >= 0 else 'Other Expense'),
            'date': data['date']
        }
        
        # Load existing transactions
        transactions = load_transactions()
        
        # Add new transaction
        transactions.append(transaction)
        
        # Save updated transactions
        save_transactions(transactions)
        
        return jsonify({'success': True, 'transaction': transaction})
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/transactions/<float:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    data = request.json
    
    # Validate input
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400
    
    try:
        # Load existing transactions
        transactions = load_transactions()
        
        # Find the transaction by ID
        for i, transaction in enumerate(transactions):
            if transaction['id'] == transaction_id:
                # Update transaction with new data, preserving the ID
                if 'amount' in data:
                    data['amount'] = float(data['amount'])
                    # Ensure amount matches type
                    if data.get('type', transaction['type']) == 'expense':
                        data['amount'] = -abs(data['amount'])
                    else:
                        data['amount'] = abs(data['amount'])
                
                # Update transaction with new data
                transactions[i] = {**transaction, **data}
                
                # Save updated transactions
                save_transactions(transactions)
                
                return jsonify({'success': True, 'transaction': transactions[i]})
        
        # If we get here, transaction wasn't found
        return jsonify({'success': False, 'message': 'Transaction not found'}), 404
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/transactions/<float:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    try:
        # Load existing transactions
        transactions = load_transactions()
        
        # Find transaction by ID and remove it
        for i, transaction in enumerate(transactions):
            if transaction['id'] == transaction_id:
                deleted_transaction = transactions.pop(i)
                
                # Save updated transactions
                save_transactions(transactions)
                
                return jsonify({'success': True, 'transaction': deleted_transaction})
        
        # If we get here, transaction wasn't found
        return jsonify({'success': False, 'message': 'Transaction not found'}), 404
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/summary', methods=['GET'])
def get_summary():
    transactions = load_transactions()
    
    # Get filter parameters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Apply date filters if they exist
    if start_date:
        transactions = [t for t in transactions if t['date'] >= start_date]
    
    if end_date:
        transactions = [t for t in transactions if t['date'] <= end_date]
    
    # Calculate summary data
    total_income = sum(t['amount'] for t in transactions if t['amount'] > 0)
    total_expenses = sum(abs(t['amount']) for t in transactions if t['amount'] < 0)
    
    # Calculate category breakdowns
    expense_categories = {}
    income_categories = {}
    
    for transaction in transactions:
        if transaction['amount'] < 0:
            category = transaction['category']
            if category in expense_categories:
                expense_categories[category] += abs(transaction['amount'])
            else:
                expense_categories[category] = abs(transaction['amount'])
        else:
            category = transaction['category']
            if category in income_categories:
                income_categories[category] += transaction['amount']
            else:
                income_categories[category] = transaction['amount']
    
    # Convert to lists for easier processing in frontend
    expense_breakdown = [{'category': cat, 'amount': amt} for cat, amt in expense_categories.items()]
    income_breakdown = [{'category': cat, 'amount': amt} for cat, amt in income_categories.items()]
    
    return jsonify({
        'total_income': total_income,
        'total_expenses': total_expenses,
        'balance': total_income - total_expenses,
        'expense_breakdown': expense_breakdown,
        'income_breakdown': income_breakdown
    })

if __name__ == '__main__':
    initialize_transactions_file()
    app.run(debug=True)