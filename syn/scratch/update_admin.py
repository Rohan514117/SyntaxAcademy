from django.contrib.auth.models import User

# Target credentials
email = 'admin@syntax.com'
password = 'syntax@academy'
username = 'admin@syntax.com' # Using email as username to match the login form expectations

try:
    # Check if user with this email/username already exists
    user = User.objects.filter(username=username).first()
    if not user:
        user = User.objects.filter(email=email).first()

    if user:
        print(f"Updating existing user: {user.username}")
        user.username = username
        user.email = email
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print("Admin user updated successfully.")
    else:
        print(f"Creating new admin user: {username}")
        User.objects.create_superuser(username=username, email=email, password=password)
        print("Admin user created successfully.")
except Exception as e:
    print(f"Error: {e}")
