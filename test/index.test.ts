import values from 'lodash/values'
import every from 'lodash/every'
import { validate } from '../src/index'

const elevenSeconds = 11 * 1000

describe('validation tests', () => {
  it('fails without sending data', async () => {
    const res = await validate({
      email: 'jubao@le.com',
      sender: 'jubao@le.com',
      validateTypo: false,
      validateDisposable: false,
    })
    expect(res.valid).toBe(false)
    expect(res.reason).toBe('smtp')
    expect(res.validators.smtp?.valid).toBe(false)
    expect(res).toMatchSnapshot()
  })
  it('fails with bad regex', async () => {
    const res = await validate('david.gmail.com')
    expect(res.valid).toBe(false)
    expect(res.reason).toBe('regex')
    expect(res.validators.regex?.valid).toBe(false)
    expect(res).toMatchSnapshot()
  })

  it('fails later with malformed regex', async () => {
    const res = await validate({
      email: 'dav id@gmail.com',
      validateRegex: false,
    })
    expect(res.valid).toBe(false)
    expect(res.reason).toBe('smtp')
    expect(res.validators.regex?.valid).toBe(true)
    expect(res.validators.smtp?.valid).toBe(false)
    expect(res).toMatchSnapshot()
  })

  it('fails with common typo', async () => {
    const res = await validate('david@gmaill.com')
    expect(res.valid).toBe(false)
    expect(res.reason).toBe('typo')
    expect(res.validators.typo?.valid).toBe(false)
    expect(res).toMatchSnapshot()
  })

  it('fails with disposable email', async () => {
    const res = await validate('david@temp-mail.org')
    expect(res.valid).toBe(false)
    expect(res.reason).toBe('disposable')
    expect(res.validators.disposable?.valid).toBe(false)
    expect(res).toMatchSnapshot()
  })

  it(
    'fails with bad dns',
    async () => {
      const res = await validate('xxx@yyy.zzz')
      expect(res.valid).toBe(false)
      expect(res.reason).toBe('mx')
      expect(res.validators.mx?.valid).toBe(false)
      expect(res).toMatchSnapshot()
    },
    elevenSeconds
  )

  it('fails with bad mailbox', async () => {
    const res = await validate({ email: 'hello+1@web3rockstars.io', validateSMTP: true, validateTypo: false })
    console.log(res)
    expect(res.valid).toBe(false)
    expect(res.reason).toBe('smtp')
    expect(res.validators.smtp?.valid).toBe(false)
  }, 30000)

  it('suceeds with good mailbox', async () => {
    const res = await validate({ email: 'hello@web3rockstars.io', validateSMTP: true, validateTypo: false })
    console.log(res)
    expect(res.valid).toBe(true)
    expect(res.validators.smtp?.valid).toBe(true)
  }, 30000)

  it(
    'passes when we skip smtp validation',
    async () => {
      const res = await validate({
        email: 'david@andco.life',
        validateSMTP: false,
      })
      expect(res.valid).toBe(true)
      expect(every(values(res.validators), x => x && x.valid)).toBe(true)
      expect(res).toMatchSnapshot()
    },
    elevenSeconds
  )

  it(
    'passes when valid special char',
    async () => {
      const res = await validate('~@oftn.org')
      expect(res.valid).toBe(true)
      expect(every(values(res.validators), x => x && x.valid)).toBe(true)
      expect(res).toMatchSnapshot()
    },
    elevenSeconds
  )

  it(
    'passes when valid wildcard',
    async () => {
      const res = await validate('info@davidalbertoadler.com')
      expect(res.valid).toBe(true)
      expect(every(values(res.validators), x => x && x.valid)).toBe(true)
      expect(res).toMatchSnapshot()
    },
    elevenSeconds
  )

  it(
    'passes with custom TLD',
    async () => {
      const res = await validate({
        email: 'info@utob.ir',
        validateSMTP: false,
        additionalTopLevelDomains: ['ir'],
      })
      expect(res.valid).toBe(true)
      expect(every(values(res.validators), x => x && x.valid)).toBe(true)
      expect(res).toMatchSnapshot()
    },
    elevenSeconds
  )
})
