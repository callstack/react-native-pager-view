#include "RNOH/Package.h"
#include "ComponentDescriptors.h"
#include "ViewPagerJSIBinder.h"
#include "ViewPagerNapiBinder.h"
#include "ViewPagerEventEmitRequestHandler.h"

using namespace rnoh;
using namespace facebook;
namespace rnoh{

  class ViewPagerPackage : public Package{
    public:
      ViewPagerPackage(Package::Context ctx) : Package(ctx){}

      std::vector<facebook::react::ComponentDescriptorProvider> createComponentDescriptorProviders() override
      {
        return {
          facebook::react::concreteComponentDescriptorProvider<facebook::react::RNCViewPagerComponentDescriptor>(),
        };
      }

      ComponentJSIBinderByString createComponentJSIBinderByName() override
      {
        return {{"RNCViewPager",std::make_shared<ViewPageJSIBinder>()}};
      };

      ComponentNapiBinderByString createComponentNapiBinderByName() override
      {
        return {{"RNCViewPager",std::make_shared<ViewPageNapiBinder>()}};
      };

      EventEmitRequestHandlers createEventEmitRequestHandlers() override
      {
        return {std::make_shared<ViewPagerEventEmitRequestHandler>()};
      }
  };
} // namespace rnoh