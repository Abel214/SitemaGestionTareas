import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Divider, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import institutionLogo from '../../assets/Common/UNL_logo.svg';
import './Login.css';
import { authService } from '../../services/authService';

const { Title, Paragraph } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [form] = Form.useForm<LoginFormValues>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin, user, isAuthenticated } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  // Redirección si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPaths = {
        'ADM': '/admin',
        'DOC': '/docente',
        'EST': '/estudiante'
      };
      navigate(redirectPaths[user.rol] || '/');
    }
  }, [user, isAuthenticated, navigate]);

  const handleLogin = async (values: LoginFormValues) => {
  try {
    setLoading(true);
    messageApi.destroy();

    // Limpiar errores previos
    form.setFields([{ name: 'email', errors: [] }, { name: 'password', errors: [] }]);

    // 1. Obtener token CSRF
    await authService.getCsrfToken();

    // 2. Intentar login
    const result = await authService.login(values.email, values.password);

    if (!result.success) {
      throw new Error(result.error || 'Error de autenticación');
    }

    // 3. Actualizar contexto de autenticación
    authLogin({
      email: result.email,
      rol: result.rol,  // Usar 'rol' en lugar de 'role'
      id: result.user_id
    });

    messageApi.success(`¡Bienvenid@ ${result.email}!`);

    // 4. Redirección basada en rol
    const roleRoutes = {
      'ADM': '/admin',
      'DOC': '/docente',
      'EST': '/estudiante'
    };

    navigate(roleRoutes[result.rol] || '/');

  } catch (error: any) {
    console.error('Error en login:', error);

    if (error.response?.status === 403) {
      form.setFields([
        { name: 'email', errors: [' '] },
        { name: 'password', errors: ['Credenciales incorrectas o acceso no autorizado'] }
      ]);
    } else if (error.message.includes('Network Error')) {
      messageApi.error('Error de conexión con el servidor');
    } else {
      messageApi.error(error.message || 'Error desconocido durante el login');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      {contextHolder}
      <div className="login-container">
        <div className="login-background"></div>
        <div className="login-card">
          <div className="login-logo-container">
            <img src={institutionLogo} alt="UNL Logo" className="login-logo"/>
          </div>

          <Title level={2} className="login-title">Inicio de Sesión</Title>
          <Paragraph className="login-subtitle">
            Ingrese sus credenciales para acceder al sistema
          </Paragraph>

          <Divider/>

          <Form
            form={form}
            name="login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={handleLogin}
            layout="vertical"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Por favor ingrese su correo electrónico' },
                { type: 'email', message: 'Correo electrónico inválido' }
              ]}
            >
              <Input
                prefix={<MailOutlined/>}
                placeholder="Correo electrónico"
                className="login-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Por favor ingrese su contraseña' }]}
            >
              <Input.Password
                prefix={<LockOutlined/>}
                placeholder="Contraseña"
                className="login-input"
              />
            </Form.Item>

            <Form.Item className="login-links">
              <Link className="login-forgot" to="/password-reset">
                ¿Olvidó su contraseña?
              </Link>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-button"
                loading={loading}
                disabled={loading}
              >
                Iniciar Sesión
              </Button>
            </Form.Item>

            <div className="login-register">
              ¿No tiene una cuenta? <Link to="/register">Regístrese</Link>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default Login;