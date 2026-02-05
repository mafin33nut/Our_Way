from django.contrib import messages
from django.contrib.auth import authenticate, get_user_model, login
from django.shortcuts import redirect, render
from django.views.decorators.http import require_http_methods


@require_http_methods(["POST", "GET"])
def register_admin(request):
    if request.method == "GET":
        return redirect("/admin/login/")

    username = request.POST.get("username", "").strip()
    email = request.POST.get("email", "").strip()
    password1 = request.POST.get("password1", "")
    password2 = request.POST.get("password2", "")

    if not username or not password1 or not password2:
        messages.error(request, "Заполните все обязательные поля.")
        return redirect("/admin/login/")

    if password1 != password2:
        messages.error(request, "Пароли не совпадают.")
        return redirect("/admin/login/")

    User = get_user_model()
    if User.objects.filter(username=username).exists():
        messages.error(request, "Пользователь с таким именем уже существует.")
        return redirect("/admin/login/")

    user = User.objects.create_user(username=username, email=email or None, password=password1)
    user.is_staff = True
    user.save(update_fields=["is_staff"])

    auth_user = authenticate(request, username=username, password=password1)
    if auth_user:
        login(request, auth_user)
        return redirect("/admin/")

    messages.error(request, "Не удалось войти. Попробуйте снова.")
    return redirect("/admin/login/")
