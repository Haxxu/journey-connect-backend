import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import { env } from './environment';

const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground';
const CLIENT_ID = env.mailClientId;
const CLIENT_SECRET = env.mailClientSecret;
const REFRESH_TOKEN = env.mailRefreshToken;
const SENDER_MAIL = env.senderMailAddress;

export async function sendMail(to: string, url: string, txt: string) {
	const oAuth2Client = new OAuth2Client(
		CLIENT_ID,
		CLIENT_SECRET,
		OAUTH_PLAYGROUND
	);

	oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

	try {
		const access_token = await oAuth2Client.getAccessToken();

		const transport = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				type: 'OAuth2',
				user: SENDER_MAIL,
				clientId: CLIENT_ID,
				clientSecret: CLIENT_SECRET,
				refreshToken: REFRESH_TOKEN,
				accessToken: access_token.token || '',
			},
		});

		const mailOptions = {
			from: SENDER_MAIL,
			to: to,
			subject: 'JourneyConnect',
			html: `
                <div style="max-width: 700px; margin: auto; border: 10px solid rgb(147 197 253); padding: 50px 20px; font-size: 110%; border-radius: 5px;">
                    <h2 style="text-align: center; text-transform: uppercase; color: #000">Welcome to <span style="color: #3b82f6">Journey Connect</span>.</h2>
                    <p>
                    Congratulations! You're almost set to start using <span style="color: #3b82f6">Journey Connect</span>. Just click the button below to validate your
                    email address.
                    </p>

                    <a
                        href="${url}"
                        style="
                            background: #3b82f6;
                            text-decoration: none;
                            color: white;
                            padding: 10px 20px;
                            margin: 10px 0;
                            display: inline-block;
                            border-radius: 5px;
                        "
                        >${txt}</a
                    >

                    <p>If the button doesn't work for any reason, you can also click on the link below:</p>

                    <div>${url}</div>
                </div>
            `,
		};

		const result = await transport.sendMail(mailOptions);

		return result;
	} catch (err) {
		console.log(err);
	}
}
