from django.core.mail.backends.smtp import EmailBackend
import smtplib

class IPv4EmailBackend(EmailBackend):
    """
    Custom EmailBackend that forces IPv4 connections.
    This resolves the [WinError 10060] timeout issue on Windows machines
    where IPv6 is enabled but not properly routed to the internet.
    """
    def open(self):
        if self.connection:
            return False
        try:
            # The source_address=('0.0.0.0', 0) forces Python's socket to use IPv4
            self.connection = self.connection_class(
                self.host, self.port, source_address=('0.0.0.0', 0), timeout=self.timeout
            )
            self.connection.ehlo()
            if self.use_tls:
                self.connection.starttls(context=self.ssl_context)
                self.connection.ehlo()
            if self.username and self.password:
                self.connection.login(self.username, self.password)
            return True
        except smtplib.SMTPException:
            if not self.fail_silently:
                raise
            return False
