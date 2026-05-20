import schedule
import time
import threading
from datetime import datetime
import pyttsx3

engine = pyttsx3.init()
reminders = []

def speak(text):
    """Speak text aloud."""
    engine.say(text)
    engine.runAndWait()

def send_reminder(medicine, note=""):
    """Send a voice reminder."""
    message = f"It's time to take your {medicine}. {note}"
    print(message)
    speak(message)

def add_reminder(medicine, time_str, note=""):
    """Add a daily reminder."""
    reminders.append({"medicine": medicine, "time": time_str, "note": note})
    schedule.every().day.at(time_str).do(send_reminder, medicine, note)
    print(f"✅ Reminder set for {medicine} at {time_str} every day.")
    speak(f"Reminder set for {medicine} at {time_str} every day.")
    return f"Reminder set for {medicine} at {time_str} every day."

def start_scheduler():
    """Run the scheduler in a background thread."""
    def run():
        while True:
            schedule.run_pending()
            time.sleep(30)
    t = threading.Thread(target=run)
    t.daemon = True
    t.start()
