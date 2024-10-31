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
import * as React from "react"

interface VerificationEmailProps {
  userName?: string
  confirmLink: string
}

const VerificationEmail: React.FC<VerificationEmailProps> = ({
  userName,
  confirmLink,
}) => {
  const previewText = `Te damos la bienvenida a Máxima Nutrición!`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className='bg-white font-sans mx-auto my-auto px-2'>
          <Container className='mx-auto my-[40px] max-w-[465px] p-[20px] border border-solid border-[#eaeaea] rounded'>
            <Section className='mt-[32px] text-center'>
              <Img
                src='https://dominio.com/static/mxm-logo.png'
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
              Verifica tu dirección de e-mail
            </Heading>
            <Text className='leading-[24px] mx-0 my-[10px] p-0 text-[14px] text-black'>
              Has creado una cuenta con la siguiente dirección de e-mail:{" "}
              <strong>{userName}</strong>
            </Text>
            <Text className='leading-[24px] mx-0 my-[10px] p-0 text-[14px] text-black'>
              Haz clic en confirmar para verificar la dirección de e-mail y
              poder realizar pedidos en nuestro sitio web.
            </Text>
            <Section className='mb-[32px] mt-[20px] text-center'>
              <Button
                className='bg-red-200 font-semibold no-underline px-5 py-3 rounded-full text-center text-[14px] text-orange-950'
                href={confirmLink}
              >
                Confirmar mi e-mail
              </Button>
            </Section>
            <Hr className='border border-solid border-[#eaeaea] mx-0 my-[26px] w-full' />
            <Text className='leading-[24px] mx-0 my-[10px] p-0 text-[12px] text-[#666]'>
              Si tiene problemas con el botón, copie y pegue la siguiente URL en
              su navegador: {confirmLink}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default VerificationEmail
