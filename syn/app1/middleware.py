from django.urls import Resolver404, resolve, reverse


STUDENT_GUARD_ROUTE_NAMES = {
    "courses",
    "profile",
    "my_enrolls",
    "payment_receipt",
    "quiz_page",
}

ADMIN_GUARD_ROUTE_NAMES = {
    "dashboard_home",
    "students_manage",
    "enrollments_manage",
    "quiz_manage",
    "quiz_questions_manage",
    "results_manage",
    "contacts_manage",
    "course_manage",
    "lesson_manage",
    "notes_manage",
    "review_manage",
    "comments_manage",
}

NO_CACHE_ROUTE_NAMES = STUDENT_GUARD_ROUTE_NAMES | ADMIN_GUARD_ROUTE_NAMES | {
    "logout",
    "admin_logout",
    "auth_status",
}


def apply_no_cache_headers(response):
    response["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0, private"
    response["Pragma"] = "no-cache"
    response["Expires"] = "0"
    return response


class AuthCacheControlMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        route_name = None

        try:
            match = resolve(request.path_info)
            route_name = match.url_name
        except Resolver404:
            match = None

        request.auth_guard_enabled = False
        request.auth_guard_login_url = ""
        request.auth_guard_status_url = ""

        if route_name in STUDENT_GUARD_ROUTE_NAMES:
            request.auth_guard_enabled = True
            request.auth_guard_login_url = reverse("login")
            request.auth_guard_status_url = f"{reverse('auth_status')}?scope=student"
        elif route_name in ADMIN_GUARD_ROUTE_NAMES:
            request.auth_guard_enabled = True
            request.auth_guard_login_url = reverse("admin_login")
            request.auth_guard_status_url = f"{reverse('auth_status')}?scope=admin"

        response = self.get_response(request)

        if route_name in NO_CACHE_ROUTE_NAMES:
            apply_no_cache_headers(response)

        return response
