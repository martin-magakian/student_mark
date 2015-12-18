var config = {
    mock_all_email: "mock@gmail.com",    	// send EVERY email to this addresse (exept cc_all_email)
    cc_all_email: "cc@gmail.com", 		// send a copy of every email sent (can't be mock)
    summary_send_to: "admin@gmail.com",	// send the marks summary to this email
    email : {
    	from: 'me@gmail.com',				  		// Name to display from the sender
        host: "ssl0.ovh.net",
        port: 587,
        login: "me@gmail.com",
        password: "myPassword",
    }
}

module.exports = config;