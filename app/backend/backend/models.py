from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from datetime import datetime
import time
from jsonfield import JSONField
# we need to define our JSON objects to be properly serialized when we render it server-side
# but for now, we can pull JSON objects by directly reading to pandas.dataframe() and pulling dicts (key/values) and rendering those numbers / equations with KaTeX
# define models in order to store logic for how data must be serialized to derive from
# must run `python manage.py makemigrations model_name` to store changes in models


class User(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    def __str__(self):
        return self.name

class Modules(models.Model):
    # need to create model for each component (question, choices, correct_choice, confidence_score)
    # must optimize for db schema sanity
    question_id = models.IntegerField()
    question = models.CharField(max_length=500)
    # store choices as JSON, but converted when rendered in django template
    choices = JSONField()
    user_answer_choice = models.CharField(max_length=1)
    user = models.CharField(max_length=100)
    start_time = models.DateField()
    end_time = models.DateField()
    # # compute session_time based on delta of end_time and start_time
    session_time = models.TimeField()
    correct_choice = models.BooleanField()
    confidence_score = models.IntegerField()
    # track instance of problem completion
    problem_completion = models.BooleanField()
    # accuracy = if correct_choice === user_answer
    user_accuracy = models.BooleanField()
    # whatever we pass to be computed must defined as model itself (count=accuracy_instance_count, accuracy=accuracy, confidence_score=confidence_score, est_mastery_time=est_mastery_time)
    # estimated mastery time = compute given confidence_score & session_time per question
    total_correct_choices = models.IntegerField()
    # track number of correctly solved answer choices
    accuracy_instance_count = models.IntegerField()
    est_mastery_time = models.TimeField()
    performance_metrics = models.IntegerField()

# setup viewsets, APIviews, serializers, queryset / serializer_classes / permission_classes
