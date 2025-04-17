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
    return jsonify(transactions)

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

if __name__ == '__main__':
    initialize_transactions_file()
    app.run(debug=True)