import { PopulatedOrder } from "@/types/types"
import { ShippingMethod } from "@prisma/client"
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"
import * as React from "react"

interface OrderDetailsProps {
  order: PopulatedOrder
  orderLink: string
}

const baseUrl = process.env.BASE_URL

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, orderLink }) => {
  const previewText = `Detalles de tu pedido en Máxima Nutrición`

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
              className='mx-0 my-[40px] p-0 text-[24px] font-bold text-center text-black'
            >
              Detalle de tu pedido
            </Heading>
            <Section className='text-center'>
              {order.shippingMethod === ShippingMethod.DELIVERY && (
                <>
                  <Text className='leading-[24px] mx-0 my-[10px] p-0 text-[14px] text-black'>
                    Hola{" "}
                    <strong>
                      {order.customer?.name || order.customer?.user?.email}
                    </strong>
                    , tu pedido se realizó correctamente y lo enviaremos a:
                  </Text>
                  <Text
                    is='h2'
                    className='leading-[24px] mx-0 my-[10px] p-0 text-[14px] text-black font-bold'
                  >
                    {`${order.address?.addressStreet} ${
                      order.address?.addressNumber
                    } ${order.address?.addressFloor || ""} ${
                      order.address?.addressApartment
                    }`.trim()}
                  </Text>
                </>
              )}
            </Section>
            {order.shippingMethod === ShippingMethod.TAKE_AWAY && (
              <Text className='leading-[24px] mx-0 my-[10px] p-0 text-[14px] text-black'>
                Hola <strong>{order.customer?.name}</strong>, tu pedido se
                realizó correctamente y podrás pasarlo a retirar por nuestra
                sucursal.
              </Text>
            )}
            <Section className='my-[16px] rounded-[8px] border border-solid border-gray-200 p-[16px] pt-0'>
              <table className='mb-[16px]' width='100%'>
                <thead>
                  <tr>
                    <th className='border-0 border-b border-solid border-gray-200 py-[8px]'>
                      &nbsp;
                    </th>
                    <th
                      align='left'
                      className='border-0 border-b border-solid border-gray-200 py-[8px] text-gray-500'
                      colSpan={6}
                    >
                      <Text className='font-semibold'>Producto</Text>
                    </th>
                    <th
                      align='center'
                      className='border-0 border-b border-solid border-gray-200 py-[8px] text-gray-500'
                    >
                      <Text className='font-semibold'>Cantidad</Text>
                    </th>
                    <th
                      align='center'
                      className='border-0 border-b border-solid border-gray-200 py-[8px] text-gray-500'
                    >
                      <Text className='font-semibold'>Precio</Text>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, index) => (
                    <tr key={index}>
                      <td className='border-0 border-b border-solid border-gray-200 py-[8px]'>
                        <Img
                          alt={item.product.name}
                          className='rounded-[8px] object-cover'
                          height={80}
                          src={
                            item.product.image
                              ? `${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/${item.product.image}`
                              : "/img/no-image.jpg"
                          }
                        />
                      </td>
                      <td
                        align='left'
                        className='border-0 border-b border-solid border-gray-200 py-[8px]'
                        colSpan={6}
                      >
                        <Text>{item.product.name}</Text>
                        <Text>{item.withSalt ? "Con sal" : "Sin sal"}</Text>
                      </td>
                      <td
                        align='center'
                        className='border-0 border-b border-solid border-gray-200 py-[8px]'
                      >
                        <Text>{item.quantity}</Text>
                      </td>
                      <td
                        align='center'
                        className='border-0 border-b border-solid border-gray-200 py-[8px]'
                      >
                        <Text>${item.product.price}</Text>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Row>
                <Column align='center'>
                  <Button
                    className='box-border w-full rounded-full bg-red-200 px-[12px] py-[12px] text-center font-semibold text-orange-950'
                    href={orderLink}
                  >
                    Ver mi pedido
                  </Button>
                </Column>
              </Row>
            </Section>

            <Section>
              <Row>
                <Column>
                  <Text className='text-left text-black font-normal'>
                    Subtotal
                  </Text>
                </Column>
                <Column>
                  <Text className='text-right text-black font-normal'>
                    ${order.subtotal}
                  </Text>
                </Column>
              </Row>

              {order.shippingCost > 0 && (
                <Row>
                  <Column>
                    <Text className='text-left text-black font-normal'>
                      Costo de envío
                    </Text>
                  </Column>
                  <Column>
                    <Text className='text-right text-black font-normal'>
                      ${order.shippingCost.toFixed(2)}
                    </Text>
                  </Column>
                </Row>
              )}

              {order.appliedPromotionName &&
                order.appliedPromotionDiscount &&
                order.subtotal && (
                  <Row>
                    <Column>
                      <Text className='text-left text-black font-normal'>
                        Descuento promocional ({order.appliedPromotionName})
                      </Text>
                    </Column>
                    <Column>
                      <Text className='text-right text-red-500 font-normal'>
                        {order.appliedPromotionDiscountType === "PERCENTAGE" ? (
                          <>
                            -{order.appliedPromotionDiscount}% (-$
                            {(order.subtotal * order.appliedPromotionDiscount) /
                              100}
                            )
                          </>
                        ) : (
                          <>-${order.appliedPromotionDiscount.toFixed(2)}</>
                        )}
                      </Text>
                    </Column>
                  </Row>
                )}

              <Row>
                <Column>
                  <Text className='text-left text-black text-[16px] font-bold'>
                    Total
                  </Text>
                </Column>
                <Column>
                  <Text className='text-right text-black text-[16px] font-bold'>
                    ${order.total.toFixed(2)}
                  </Text>
                </Column>
              </Row>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default OrderDetails
