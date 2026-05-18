
import { Helmet } from "react-helmet-async";
import { Container, Form, Button } from "react-bootstrap";

function Admissions() {
  return (
    <Container className="mt-5">
      <Helmet>
        <title>Admissions | Kitale Progressive School</title>
        <meta name="description" content="Apply to Kitale Progressive School" />
      </Helmet>

      <h1 data-aos="fade-up">Admissions</h1>
      <p>Join our vibrant academic community.</p>

      <Form action="https://formsubmit.co/YOUR_EMAIL_HERE" method="POST">
        <input type="hidden" name="_captcha" value="false" />
        <input type="text" name="_honey" style={{display:"none"}} />

        <Form.Group className="mb-3">
          <Form.Label>Student Name</Form.Label>
          <Form.Control type="text" name="Student Name" required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Parent Email</Form.Label>
          <Form.Control type="email" name="Email" required />
        </Form.Group>

        <Button type="submit">Submit Application</Button>
      </Form>
    </Container>
  );
}

export default Admissions;
