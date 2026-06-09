from urllib.parse import parse_qs, urlparse

from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from .models import Course, Registration


class LoginRedirectTests(TestCase):
    def setUp(self):
        self.course = Course.objects.create(
            name="Python Basics",
            description="Intro course",
        )
        self.student = Registration.objects.create(
            name="Test Student",
            email="student@example.com",
            mobile=1234567890,
            password="secret12!",
            level="beginner",
        )

    def test_protected_page_redirects_to_login_with_next(self):
        target_url = reverse("courses", args=[self.course.id])

        response = self.client.get(target_url)

        self.assertEqual(response.status_code, 302)
        self.assertEqual(urlparse(response.url).path, reverse("login"))
        self.assertEqual(parse_qs(urlparse(response.url).query).get("next"), [target_url])
        self.assertEqual(self.client.session.get("login_next"), target_url)

    def test_successful_login_returns_to_requested_page(self):
        target_url = reverse("courses", args=[self.course.id])

        response = self.client.post(
            reverse("login"),
            {
                "email": self.student.email,
                "password": self.student.password,
                "next": target_url,
            },
        )

        self.assertRedirects(response, target_url, fetch_redirect_response=False)
        session = self.client.session
        self.assertEqual(session.get("login"), self.student.email)
        self.assertEqual(session.get("user_id"), self.student.id)
        self.assertEqual(session.get("user_name"), self.student.name)

    def test_login_falls_back_to_home_for_unsafe_next(self):
        response = self.client.post(
            reverse("login"),
            {
                "email": self.student.email,
                "password": self.student.password,
                "next": "https://evil.example/phish",
            },
        )

        self.assertRedirects(response, reverse("index"), fetch_redirect_response=False)

    def test_protected_page_is_served_with_no_cache_headers(self):
        session = self.client.session
        session["login"] = self.student.email
        session["user_id"] = self.student.id
        session["user_name"] = self.student.name
        session.save()

        response = self.client.get(reverse("courses", args=[self.course.id]))

        self.assertEqual(response.status_code, 200)
        self.assertIn("no-store", response["Cache-Control"])
        self.assertEqual(response["Pragma"], "no-cache")

    def test_logout_clears_auth_and_marks_response_no_cache(self):
        session = self.client.session
        session["login"] = self.student.email
        session["user_id"] = self.student.id
        session["user_name"] = self.student.name
        session.save()

        logout_response = self.client.get(reverse("logout"))
        auth_status_response = self.client.get(reverse("auth_status") + "?scope=student")

        self.assertEqual(logout_response.status_code, 200)
        self.assertIn("no-store", logout_response["Cache-Control"])
        self.assertEqual(
            logout_response.cookies[settings.SESSION_COOKIE_NAME]["max-age"],
            0,
        )
        self.assertJSONEqual(
            auth_status_response.content,
            {
                "authenticated": False,
                "login_url": reverse("login"),
                "scope": "student",
            },
        )


class AdminLoginRedirectTests(TestCase):
    def setUp(self):
        self.admin_user = get_user_model().objects.create_user(
            username="adminuser",
            password="secretpass123",
            is_staff=True,
        )

    def test_admin_login_returns_to_requested_dashboard_page(self):
        target_url = reverse("course_manage")

        response = self.client.post(
            reverse("admin_login"),
            {
                "username": self.admin_user.username,
                "password": "secretpass123",
                "next": target_url,
            },
        )

        self.assertRedirects(response, target_url, fetch_redirect_response=False)

    def test_admin_logout_clears_auth_and_marks_response_no_cache(self):
        self.client.force_login(self.admin_user)

        logout_response = self.client.get(reverse("admin_logout"))
        auth_status_response = self.client.get(reverse("auth_status") + "?scope=admin")

        self.assertEqual(logout_response.status_code, 200)
        self.assertIn("no-store", logout_response["Cache-Control"])
        self.assertJSONEqual(
            auth_status_response.content,
            {
                "authenticated": False,
                "login_url": reverse("admin_login"),
                "scope": "admin",
            },
        )
