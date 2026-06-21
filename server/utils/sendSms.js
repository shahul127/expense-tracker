const twilio=require('twilio');
const client=twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);
const sendSms=async (phone,otp) => {
    await client.messages.create(
        {
            body:`The otp for login is ${otp} and valid for 5 minutes and don't share with anyone`,
            from:process.env.TWILIO_PHONE,
            to:`+91${phone}`
        }
    );
};
module.exports=sendSms;