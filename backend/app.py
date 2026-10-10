from flask import Flask,jsonify
from flask_cors import CORS

app =Flask(__name__)#initiates backend server shi
CORS(app)

@app.route("/")
def home():
    return jsonify({
        "message": "WildQuest backend is running!",
        "status": "success"
    })
@app.route("/health")
def health():
    return jsonify({
        "status": "healthy"
    })

if __name__=="__main__":#other files if import this will have __name__==app
    app.run(debug =True,port =5000)