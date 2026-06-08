print("Importing os, dotenv...")
import os
from dotenv import load_dotenv
load_dotenv()
print("Importing fastapi...")
from fastapi import FastAPI
print("Importing Celery class from celery...")
from celery import Celery
print("Imported Celery class.")
print("Importing tasks.campaign_tasks...")
from tasks import campaign_tasks
print("Success!")
