import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"

const baseUrl = process.env.BASE_URL

const PasswordReset = ({
  userName,
  resetLink,
}: {
  userName?: string
  resetLink?: string
}) => {
  const previewText = `Recupera tu contraseña en Máxima Nutrición`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className='bg-white font-sans mx-auto my-auto px-2'>
          <Container className='mx-auto my-[40px] max-w-[465px] p-[20px] border border-solid border-[#eaeaea] rounded'>
            <Section className='mt-[32px] text-center'>
              <Img
                src={`${baseUrl}/img/mxm-logo.png`}
                alt='Logo'
                className='mx-auto'
                width='120'
                height='auto'
              />
            </Section>
            <Heading
              as='h1'
              className='mx-0 my-[30px] p-0 text-[24px] font-bold text-center text-black'
            >
              Recupera tu contraseña
            </Heading>
            <Text className='leading-[24px] mx-0 my-[10px] p-0 text-[14px] text-black'>
              Hola <strong>{userName}</strong>, hemos recibido una solicitud
              para restablecer tu contraseña.
            </Text>
            <Text className='leading-[24px] mx-0 my-[10px] p-0 text-[14px] text-black'>
              Si no solicitaste este cambio, puedes ignorar este correo. De lo
              contrario, haz click en el botón de abajo para restablecer tu
              contraseña:
            </Text>
            <Section className='mb-[32px] mt-[20px] text-center'>
              <Button
                className='bg-red-200 font-semibold no-underline px-5 py-3 rounded-full text-center text-[14px] text-orange-950'
                href={resetLink}
              >
                Restablecer contraseña
              </Button>
            </Section>
            <Hr className='border border-solid border-[#eaeaea] mx-0 my-[26px] w-full' />
            <Text className='leading-[24px] mx-0 my-[10px] p-0 text-[12px] text-[#666]'>
              Si tienes problemas con el botón, copia y pega la siguiente URL en
              tu navegador: {resetLink}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default PasswordReset
