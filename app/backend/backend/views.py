# base
import re
import base64
import io

# time
import time
from time import sleep
import datetime

# handling data
import pandas
import pandas as pd
import matplotlib
import numpy as np

# rendering
from django.shortcuts import render, redirect, render_to_response

# json
import jsonify
import json, urllib
from django.http import JsonResponse

# landing page
def index(request):
    return render(request, "index.html")

# modules
def modules(request):
    return render(request, "modules.html")

def tutors(request):
    return render(request, "tutors.html")

def dashboard(request):
    return render(request, "dashboard.html")

def multiplayer(request):
    return render(request, "multiplayer.html")

def about(request):
    return render(request, "about.html")

# modules/training (gateway for problem_sets) = render arithmetic.html
def arithmetic(request):
    # for now, render the page itself first
    return render(request, "arithmetic.html")
    # perform all computations given instance of GET request 
    if request.method == 'GET':
        # make random form instance for placeholder operation
        form = URLForm()
        # core functions
            # retrieve questions, and choices
            # startTime=TRUE (start time to track session_time)
        
        # make api request to pandas to access dataframe to get dict for questions, return=1

        # render latex equations from JSON strings that had been converted from mathjax

        # store JSON in pandas.dataframe, then store pandas.dataframe in SQLite

        # to add confidence_score && user_xp, use pandas.DataFrame.apply()

        # let's store our JSON first, then prepare it for server-side rendering (template)

        # store JSON from API call, and then pass JSON as python object

        # pull from database that stores JSON to be rendered in template

        # pass dict from JSON for server-side rendering w template
            #init
            # question = []
            # choices = []
            # exams = {}
            # exams['question'] = response['question']
            # exams['choices'] = response['choices']




# wrap computations in function to handle pulling and adding JSON data through pandas.dataframe
# make sqlite connection so you can pass JSON to be stored into pandas dataframe and then into SQLite Database
    # get templates working first
    # pandas.DataFrame.to_sql()
    # sqlite.connection()

# dashboard
    # pull analytics from pandas.dataframe which calls SQLite (stored JSON) and convert to matplotlib graphs
    # graph / plot:
        # estimated time of mastery,
        # # of total correct questions solved,
        # # of matches won,
        # # of minutes spent on average per question,
        # total xp (computed in respect to session_time, confidence_score, and if response['answer'] === form passed through template to backend)
    # def dashboard(request):
    # return render(request, 'dashboard.html')

# multiplayer
    # hit SQLite to pass JSON as python objects to be rendered as server-side template
    # simulate competition by rendering progress bar with PC competitor
    # feature request: setup CRUD properties to allow users to CRUD their own problem_sets
    # feature request: setup public / private sessions


# tutors
    # grid of sample users (tutors)
    # filter via availability and category_speciality
    # render # of kids who have solved a specific a "difficult" problem (social pressure / motivation)
    # allow user to navigate for tutors and filter based on category
    # prompt for category specification
    # display active tutor users
    # store created users in SQL
    # must store user accounts, performance_metrics, status (tutor, student, both), exam_results

# profile
    # user can access settings / notifications page to personalize their settings
    # if request.method == 'GET': profile_pic = request.FILE['myfile'] (user can upload profile picture)


# Build and implement confidence-based algorithm, for every 1 instance of completion {onSubmit} => {launch popup that collects user confidence ranked via 0-5}
# allow the user to focus on weaker problem types after assessing their baseline given confidence_score, accuracy, and assessing what problems must be returned in rank order of priority (in respect to weaker problem types)
# Weaker problem types will be prioritized in rank order based on results from popups
# Scale of distribution of matches for users (within classroom, then district, then region, then country)

# view decorators: https://docs.djangoproject.com/en/3.0/topics/http/decorators/

