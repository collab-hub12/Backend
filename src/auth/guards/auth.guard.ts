import {createClerkClient} from '@clerk/clerk-sdk-node';
import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {

  //constructor(@Inject(clerkAsyncProvider) private readonly clerk: ClerkClient) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    try {
      console.log(request.cookies.__session);
      const clerk = createClerkClient({secretKey: "sk_test_ikDeYg3qyTtmdnsthPbig6gE0858cx4SY9nhMRD2En"})
      const data = await clerk.clients.verifyClient("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXYiOiJkdmJfMmcyMjdHWDg2QjMyZkhzckFmbDBIR0s0WlFnIiwiaWQiOiJjbGllbnRfMmcyNFl3VDdHb01vWnduTFVBWWlxSXhTT1A5Iiwicm90YXRpbmdfdG9rZW4iOiIxeTdneGJza2hibzA0dWI4eWs5czZ3ZWZzNHU2cnV1N3RrMjM1aHcyIn0.OUHC--mdVdw4apcqmC6U37DICIzuEYBe2RKXbRlNyz-q3rAPUViz8Gzy6SlynXAuwhB4KV1zGKvMwEdZsusUBzThCigH_roUfqyELrG1P35qyFAvprK_VQNAf-vleQtBgpOSnhrIh-v6EQxhcMz4564cPh741sAbYw8Q_8d6Bv37jb-8DEYHfjDmcFa-rDdwt6dZMjNt_v5GaA5W44TIp6erOe50BbZAcU9ZgGsJ7CqMBeSEsqFW6qVX30-ZUWoMEw-ER8tAIMmdRX_IuCHzmeGhYGefbsWjfe732L4KuO0BSI_c8u_OEkWlawXM5-N8uOVv3CFnOQKWscfmwnZLAw")
      return false
    } catch (err) {
      console.log(err);
      return false;
    }

    return true;
  }
}
