# Password recovery

In Supabase Authentication → URL Configuration, add the app's reset return URL
to Redirect URLs, for example `https://your-domain.example/?reset-password=1`.
For local development, add `http://localhost:5173/?reset-password=1`.
Use the app's actual pathname if it is hosted under a subdirectory.

The recovery email template must retain Supabase's `{{ .ConfirmationURL }}` link
so Supabase verifies the recovery token before redirecting to the app.

Manual verification with a test account:

1. Log out, select **Forgot password?**, and enter the account email.
2. Follow the newest reset email link. Confirm it opens **Set a new password**.
3. Check that mismatched confirmation is rejected, then save a new password.
4. Continue to the portfolio and confirm the existing data is still present.
5. Log out and verify login with the new password; the old password should fail.
6. Open an expired or previously used link in a signed-out browser. Confirm a new
   reset email can be requested without displaying the portfolio.

Recovery uses Supabase Auth's password update on the existing user. It does not
create users, change user IDs, or write portfolio or storage data. The app gates
portfolio loading while the recovery form is displayed.
