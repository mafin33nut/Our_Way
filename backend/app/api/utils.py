from rest_framework.routers import DefaultRouter 
from django.urls import include, path
#Import sub-app router modules (these modules expose router or urlpatterns)
from app.achivments import api as ach_api # existing from app.user import urls as user_urls # existing - provides urlpatterns from app.Focus import urls as focus_urls # existing - provides urlpatterns from app.Clans import urls as clans_urls # existing - provides urlpatterns from app.activities import urls as activities_urls # new app

router = DefaultRouter()
#Keep router empty here for global viewsets; individual apps expose their own routers/urls
urlpatterns = [ path('', include(user_urls)), path('achievements/', include(ach_api)), path('focus/', include(focus_urls)), path('clans/', include(clans_urls)), path('activities/', include(activities_urls))]
#expose router variable for convenience
api_router = router
