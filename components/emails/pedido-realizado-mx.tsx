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
    Row,
    Column,
  } from '@react-email/components'
  import { Tailwind } from '@react-email/tailwind'
  import * as React from 'react'
  
  const OrderDetails = ({
    userName,
    orderLink,
  }: {
    userName?: string
    products?: { name: string; quantity: number; price: string; imageUrl: string }[]
    totalPrice?: string
    orderLink?: string
  }) => {
    const previewText = `Detalles de tu pedido en Máxima Nutrición`
  
    return (
      <Html>
        <Head />
        <Preview>{previewText}</Preview>
        <Tailwind>
          <Body className="bg-white font-sans mx-auto my-auto px-2">
            <Container className="mx-auto my-[40px] max-w-[465px] p-[20px] border border-solid border-[#eaeaea] rounded">
            <Section className='mt-[32px] text-center'>
                <Img
                  src='/static/mxm-logo.png'
                  alt='Logo'
                  className='mx-auto'
                  width='120'
                  height='auto'
                />
              </Section>
              <Section className="py-[16px] text-center">
                <Heading as="h1" className='mx-0 my-[30px] p-0 text-[24px] font-bold text-center text-black'>
                  Detalle de tu pedido
                </Heading>
                <Text className='leading-[24px] mx-0 my-[10px] p-0 text-[14px] text-black'>
                Hola <strong>{userName}</strong> tu pedido se realizo correctamente, lo eviaremos a:
              </Text>
              <Text is="h2" className='leading-[24px] mx-0 my-[10px] p-0 text-[14px] text-black font-bold'>
              Pacheco, 1977 - 1 B - Ciudad Autónoma de Buenos Aires - Ciudad Autónoma de Buenos Aires CP 1431
              </Text>
                <Section className="my-[16px] rounded-[8px] border border-solid border-gray-200 p-[16px] pt-0">
                  <table className="mb-[16px]" width="100%">
                    <thead>
                      <tr>
                        <th className="border-0 border-b border-solid border-gray-200 py-[8px]">
                          &nbsp;
                        </th>
                        <th
                          align="left"
                          className="border-0 border-b border-solid border-gray-200 py-[8px] text-gray-500"
                          colSpan={6}
                        >
                          <Text className="font-semibold">Producto</Text>
                        </th>
                        <th
                          align="center"
                          className="border-0 border-b border-solid border-gray-200 py-[8px] text-gray-500"
                        >
                          <Text className="font-semibold">Cantidad</Text>
                        </th>
                        <th
                          align="center"
                          className="border-0 border-b border-solid border-gray-200 py-[8px] text-gray-500"
                        >
                          <Text className="font-semibold">Precio</Text>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                        <tr>
                          <td className="border-0 border-b border-solid border-gray-200 py-[8px]">
                            <Img
                              alt=''
                              className="rounded-[8px] object-cover"
                              height={80}
                              src='https://react.email/static/braun-classic-watch.jpg'
                            />
                          </td>
                          <td
                            align="left"
                            className="border-0 border-b border-solid border-gray-200 py-[8px]"
                            colSpan={6}
                          >
                            <Text>Veggie Burrito</Text>
                          </td>
                          <td
                            align="center"
                            className="border-0 border-b border-solid border-gray-200 py-[8px]"
                          >
                            <Text>1</Text>
                          </td>
                          <td
                            align="center"
                            className="border-0 border-b border-solid border-gray-200 py-[8px]"
                          >
                            <Text>$4.500</Text>
                          </td>
                        </tr>
                    </tbody>
                  </table>
                  <Row>
                    <Column align="center">
                      <Button
                        className="box-border w-full rounded-full bg-red-200 px-[12px] py-[12px] text-center font-semibold text-orange-950"
                        href={orderLink}
                      >
                        Ver mi pedido
                      </Button>
                    </Column>
                  </Row>
                </Section>
                <Text className="text-right text-black text-[16px] font-normal">
                  Envío: $5.000
                </Text>
                <Text className="text-right text-black text-[16px] font-bold">
                  Total: $52.000
                </Text>
              </Section>
            </Container>
          </Body>
        </Tailwind>
      </Html>
    )
  }
  
  export default OrderDetails
  