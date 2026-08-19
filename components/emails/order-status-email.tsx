import { OrderStatus, ShippingMethod } from "@prisma/client"
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"
import * as React from "react"
import { orderStatusCopy } from "@/lib/mail/order-status-copy"

interface OrderStatusEmailProps {
  customerName: string
  status: OrderStatus
  shippingMethod: ShippingMethod
  orderLink: string
}

const baseUrl = process.env.BASE_URL

const OrderStatusEmail: React.FC<OrderStatusEmailProps> = ({
  customerName,
  status,
  shippingMethod,
  orderLink,
}) => {
  const { preview, heading, body } = orderStatusCopy(status, shippingMethod)

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className='bg-white font-sans mx-auto my-auto px-2'>
          <Container className='mx-auto my-[40px] max-w-[465px] p-[20px] border border-solid border-[#eaeaea] rounded'>
            <Section className='mt-[32px] text-center'>
              <Img
                src={`${baseUrl}/img/logo-mxm.svg`}
                alt='Máxima Nutrición'
                className='mx-auto'
                width='120'
                height='auto'
              />
            </Section>

            <Heading
              as='h1'
              className='mx-0 my-[32px] p-0 text-[24px] font-bold text-center text-black'
            >
              {heading}
            </Heading>

            <Text className='leading-[24px] text-[14px] text-black'>
              Hola <strong>{customerName}</strong>,
            </Text>
            <Text className='leading-[24px] text-[14px] text-black'>
              {body}
            </Text>

            <Section className='my-[32px] text-center'>
              <Button
                href={orderLink}
                className='box-border w-full rounded-full bg-red-200 px-[12px] py-[12px] text-center font-semibold text-orange-950'
              >
                Ver mi pedido
              </Button>
            </Section>

            <Text className='text-[12px] text-[#666666]'>
              Máxima Nutrición — viandas para celíacos, sin TACC.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default OrderStatusEmail
