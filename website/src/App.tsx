import { ReactNode, useState } from 'react';
import { Box, Button, Container, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import Modal from './components/Modal';

type Values = {
  title: string;
  body: string;
  email: string;
  scheduledAt: string;
}

const regexpEmail = /^[a-zA-Z0-9_+-]+(.[a-zA-Z0-9_+-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;

const getDateAfterYear = (yearsLater: number) => {
  const now = new Date();
  now.setFullYear(now.getFullYear() + yearsLater);
  return now.toISOString();
};

const dateOptions = [
  { label: 'テスト用今すぐ', value: new Date().toISOString() },
  { label: '1年後', value: getDateAfterYear(1) },
  { label: '5年後', value: getDateAfterYear(5) },
  { label: '10年後', value: getDateAfterYear(10) },
];

const initialValues: Values = {
  title: "",
  body: "",
  email: "",
  scheduledAt: dateOptions[0].value,
};

type ModalState = {
  isOpen: boolean;
  title?: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
  actions?: ReactNode;
};

function App() {
  const [values, setValues] = useState<Values>(initialValues);
  const [modalContent, setModalContent] = useState<ModalState>({
    isOpen: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const name = target.name;
    setValues({ ...values, [name]: target.value });
  };

  const handleDateChange = (event: SelectChangeEvent<string>) => {
    setValues({ ...values, scheduledAt: event.target.value });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // 二重送信防止
    setIsSubmitting(true);
    try {
      const apiEndpoint = (window as any).AppConfig.API_ENDPOINT;
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: values.title,
          body: values.body,
          email: values.email,
          scheduledAt: values.scheduledAt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Success:', data);
      const scheduledDate = new Date(values.scheduledAt);
      const dateTimeFormat = new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      setModalContent({
        isOpen: true,
        title: '送信完了',
        description: `${dateTimeFormat.format(scheduledDate)}の今日、あなたにメールが届きます！`,
      });
      setValues({ ...initialValues });
    } catch (error) {
      console.error('Error:', error);
      setModalContent({
        isOpen: true,
        title: '送信に失敗しました',
        description: '時間をおいて再度お試しください。',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setModalContent({
      isOpen: false,
    });
  };

  // メールアドレスが有効かどうかを判定する変数
  const isEmailValid = values.email === '' || regexpEmail.test(values.email);

  // フォームが送信可能かどうかを判定する変数
  const isSubmittable = values.title !== '' && values.body !== '' && regexpEmail.test(values.email);

  return (
    <section>
      <Container maxWidth="sm">
        <h2>タイムカプセルメール</h2>
        <Box component="form" noValidate autoComplete="off">
          <TextField
            name="title"
            id="title"
            label="タイトル"
            variant="filled"
            margin="dense"
            fullWidth
            value={values.title}
            onChange={handleChange}
          />
          <TextField
            name="body"
            id="body"
            label="メッセージ"
            multiline
            minRows={12}
            variant="filled"
            margin="dense"
            fullWidth
            value={values.body}
            onChange={handleChange}
          />
          <FormControl fullWidth variant="filled" margin="dense">
            <InputLabel id="scheduledAt-label">送信日時</InputLabel>
            <Select
              labelId="scheduledAt-label"
              id="scheduledAt"
              name="scheduledAt"
              value={values.scheduledAt}
              onChange={handleDateChange}
              label="送信日時"
            >
              {dateOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            name="email"
            id="email"
            label="メールアドレス"
            variant="filled"
            margin="dense"
            fullWidth
            value={values.email}
            onChange={handleChange}
            error={!isEmailValid}
            helperText={!isEmailValid ? "Incorrect Email address format." : null}
          />
          <br />
          <br />
          <Button
            variant="contained"
            size="large"
            endIcon={<SendIcon />}
            disabled={!isSubmittable || isSubmitting}
            onClick={handleSubmit}
          >
            メール送信予約
          </Button>
        </Box>
      </Container>
      <Modal
        open={modalContent.isOpen || false}
        onClose={handleCloseModal}
        title={modalContent.title}
        description={modalContent.description}
        actions={modalContent.actions}
      >
        {modalContent.content}
      </Modal>
    </section>
  );
}

export default App;
