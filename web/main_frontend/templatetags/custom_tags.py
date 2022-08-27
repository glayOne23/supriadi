from django import template
import datetime
import dateutil.parser

register = template.Library()


def date_formater(value):                
    date_object = dateutil.parser.parse(value)
    return date_object



register.filter('date_formater', date_formater)