import { useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmModal,
  Modal,
  Select,
  TextArea,
  TextInput,
  ToastProvider,
  useToast,
} from './components/ui'

function Demo() {
  const { showToast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [title, setTitle] = useState('')

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-bold text-slate-900">UI kit demo (temporary)</h1>

      <div className="flex flex-wrap gap-2">
        <Button>Primary</Button>
        <Button variant="secondary" size="sm">Secondary sm</Button>
        <Button variant="destructive" size="lg">Destructive lg</Button>
        <Button disabled>Disabled</Button>
      </div>

      <div className="flex gap-2">
        <Badge>Backlog</Badge>
        <Badge color="blue">Medium</Badge>
        <Badge color="red">High</Badge>
        <Badge color="green">Done</Badge>
      </div>

      <Alert variant="error" title="Storage unavailable">
        Changes will not be saved.
      </Alert>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Sample card</h2>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-slate-600">Card body text.</p>
        </CardBody>
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => setIsModalOpen(true)}>Open modal</Button>
        <Button variant="secondary" onClick={() => showToast('Task saved')}>Show toast</Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Demo modal">
        <div className="space-y-4">
          <TextInput
            id="demo-title"
            label="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            error={title.trim() === '' ? 'Title is required' : ''}
          />
          <Select id="demo-priority" label="Priority" options={['Low', 'Medium', 'High']} defaultValue="Medium" />
          <TextArea id="demo-description" label="Description" hint="Optional" />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsConfirmOpen(true)}>Open confirm</Button>
            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Sibling of the first Modal, not inside it, so the two dialogs stay independent */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Discard changes?"
        message="Your edits will be lost."
        confirmLabel="Discard"
        isDestructive
        onConfirm={() => {
          setIsConfirmOpen(false)
          setIsModalOpen(false)
        }}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  )
}

export default App