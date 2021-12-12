const express = require("express")

const nodemailer = require("nodemailer")
const sendgridTransport = require("nodemailer-sendgrid-transport")
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const cors = require("cors")
app.use(cors())
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  )
  next()
})

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "YOUR_SENDGRID_API_KEY_HERE",
    },
  })
)

function isValidEmail(email) {
  return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    String(email).toLowerCase()
  )
}

function sanitizeMessage(message) {
  return message.replace(/<\/?[^>]+(>|$)/g, "")
}

/*
####################################################################################################
method: POST
action: /send-mail
####################################################################################################
eg JSON request:
{
  "email": "test@gmail.com",
  "fullname": "haroon",
  "subject": "test subject",
  "message": "hello"
}
####################################################################################################
response json from this endpoint:
  Success: {
    status: "success",
    statuscode: 200,
    message: "Mail sent Successfully",
  }

  Any client-side error: {
    status: "error",
    statuscode: 422,
    message: "Invalid email id entered",
  }

  Any server-side error: {
    status: "error",
    statuscode: 500,
    message: "Error occurred while processing request",
  }
####################################################################################################
*/

app.post("/send-mail", (req, res) => { // you can set your own route here rather than "send-mail"
  email_id = req.body.email
  fullname = sanitizeMessage(req.body.fullname)
  subject = sanitizeMessage(req.body.subject)
  message = sanitizeMessage(req.body.message)

  console.log({ fullname, subject, message, email_id })

  if (isValidEmail(email_id)) {
    return transporter.sendMail(
      {
        to: ["test@gmail.com"], // receiver email address
        from: "test@testsendgrid.com", //replace with your sendgrid account email id
        subject: subject,
        html:
          `<h1>${fullname} has sent you a message from BLA_BLA Website:</h1>` + // replace with your html template
          `<p>Email: ${email_id}</p>` +
          `<p>${message}</p>`,
      },
      function (err, response) {
        if (err) {
          console.log(err)
          res.status(500).json({
            status: "error",
            statuscode: 500,
            message: "Error occurred while processing request",
          })
        } else {
          console.log(response)
          res.json({
            status: "success",
            statuscode: 200,
            message: "Mail sent Successfully",
          })
        }
      }
    )
  } else {
    res.status(422).json({
      status: "error",
      statuscode: 422,
      message: "Invalid email id entered",
    })
  }
})

app.get("/", (req, res) => {
  res.send(`SERVER WORKS`) //test endpoint to check if server is running or not (you can remove this)
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server started running on port ${PORT}`)
})
