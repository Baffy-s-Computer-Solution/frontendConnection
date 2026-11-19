import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Form, ListGroup } from '../../../components/ui/tailwindCompat';

describe('Tailwind compatibility components', () => {
  it('renders compound list items and form helper text', () => {
    render(
      <>
        <ListGroup>
          <ListGroup.Item>Job location</ListGroup.Item>
        </ListGroup>
        <Form>
          <Form.Group>
            <Form.Text>Cover letter guidance</Form.Text>
          </Form.Group>
        </Form>
      </>,
    );

    expect(screen.getByText('Job location')).toBeInTheDocument();
    expect(screen.getByText('Cover letter guidance')).toBeInTheDocument();
  });
});
